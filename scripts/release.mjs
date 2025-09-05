#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(process.cwd());
const pkgPath = path.join(root, 'package.json');
const changelogPath = path.join(root, 'CHANGELOG.md');

const bumpType = process.argv[2];
if (!['patch', 'minor', 'major'].includes(bumpType)) {
  console.error('Bump type required: patch | minor | major');
  process.exit(1);
}

function run(cmd) {
  return execSync(cmd, { stdio: 'pipe' }).toString().trim();
}

function ensureCleanGit() {
  const status = run('git status --porcelain');
  if (status) {
    console.error('Working tree not clean. Commit or stash changes first.');
    process.exit(1);
  }
}

function runPrettier() {
  console.log('Running Prettier formatting...');
  try {
    run('npm run format');
  } catch (e) {
    console.error('Prettier formatting failed.');
    console.error(e.message || e);
    process.exit(1);
  }
}

function bumpVersion(version, type) {
  const [maj, min, pat] = version.split('.').map(Number);
  if (type === 'major') return `${maj + 1}.0.0`;
  if (type === 'minor') return `${maj}.${min + 1}.0`;
  return `${maj}.${min}.${pat + 1}`;
}

function updatePackageJson() {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const oldVersion = pkg.version;
  const newVersion = bumpVersion(oldVersion, bumpType);
  pkg.version = newVersion;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  return { oldVersion, newVersion };
}

function formatDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function updateChangelog(newVersion) {
  let text = readFileSync(changelogPath, 'utf8');

  // Guarantee base skeleton
  if (!/## Unreleased/i.test(text)) {
    if (!/# Changelog/.test(text)) {
      text = '# Changelog\n\n## Unreleased\n- No unreleased changes.\n';
    } else {
      text = text.replace(
        /# Changelog\n?/,
        '# Changelog\n\n## Unreleased\n- No unreleased changes.\n\n',
      );
    }
  }

  const date = formatDate();

  const unreleasedHeader = '## Unreleased\n';
  const unreleasedIndex = text.indexOf(unreleasedHeader);
  if (unreleasedIndex === -1) {
    throw new Error('Could not locate Unreleased section after ensuring it exists.');
  }

  const afterUnreleased = text.slice(unreleasedIndex + unreleasedHeader.length);
  const nextVersionHeadingRegex = /\n## \d+\.\d+\.\d+ - /;
  const nextMatchIndex = afterUnreleased.search(nextVersionHeadingRegex);
  let unreleasedBodyRaw;
  let restVersions;
  if (nextMatchIndex !== -1) {
    unreleasedBodyRaw = afterUnreleased.slice(0, nextMatchIndex).trim();
    restVersions = afterUnreleased.slice(nextMatchIndex + 1);
  } else {
    unreleasedBodyRaw = afterUnreleased.trim();
    restVersions = '';
  }

  let unreleasedBody = unreleasedBodyRaw;
  if (!unreleasedBody || /No unreleased changes/i.test(unreleasedBody)) {
    unreleasedBody = '- Internal changes only.';
  }

  const newVersionSection = `## ${newVersion} - ${date}\n- ${date}\n${unreleasedBody}\n\n`;

  const prefix = text.slice(0, unreleasedIndex);
  const placeholderUnreleased = '## Unreleased\n- No unreleased changes.\n\n';
  const final =
    `${prefix}${placeholderUnreleased}${newVersionSection}${restVersions.trimStart()}`.trimEnd() +
    '\n';
  writeFileSync(changelogPath, final);
}

function gitCommitTagPush(newVersion) {
  run('git add -u');
  run(`git commit -m "chore(release): v${newVersion}"`);
  run(`git tag v${newVersion}`);
  const currentBranch = run('git rev-parse --abbrev-ref HEAD');
  run(`git push origin ${currentBranch}`);
  run(`git push origin v${newVersion}`);
  console.log(`\nRelease v${newVersion} pushed. GitHub Action will publish.`);
}

(function main() {
  ensureCleanGit();
  runPrettier();
  const { newVersion } = updatePackageJson();
  updateChangelog(newVersion);
  gitCommitTagPush(newVersion);
})();
