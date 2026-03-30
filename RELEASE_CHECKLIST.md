# Release Checklist

Use this checklist before announcing a new release publicly.

## Version Bump (from feature/dev branch)

All version bumping uses [Conventional Commits](https://www.conventionalcommits.org/) and `standard-version`.

### Commit message format

Write commits using these prefixes to control version bumping:

- `feat: ...` — new feature → bumps **minor** (0.1.11 → 0.2.0)
- `fix: ...` — bug fix → bumps **patch** (0.1.11 → 0.1.12)
- `feat!: ...` or `BREAKING CHANGE:` in body → bumps **major** (0.1.11 → 1.0.0)
- `docs:`, `chore:`, `style:`, `test:`, `ci:` — no version bump, not shown in changelog

### Bump and changelog

```bash
# Auto-detect bump type from commits:
npm run release

# Or force a specific bump:
npm run release:patch
npm run release:minor
npm run release:major

# Preview what would happen (no changes):
npm run release:dry
```

This updates version in all 3 files (`package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`), generates `CHANGELOG.md`, creates a commit, and tags it.

## Pre-Release

- [ ] Test the app locally with `npm run tauri build`
- [ ] Review the generated CHANGELOG.md
- [ ] Merge to `main` branch

## Release

- [ ] Push the tag: `git push --follow-tags origin main`
- [ ] Wait for GitHub Actions workflow to complete (~10-15 minutes)
- [ ] Verify workflow succeeded: https://github.com/mjlemay/blumbotron/actions

## Post-Release Verification

- [ ] Check that release appears: https://github.com/mjlemay/blumbotron/releases/latest
- [ ] **Verify all download links work:**
  - [ ] macOS: https://github.com/mjlemay/blumbotron/releases/latest/download/blumbotron_x64.dmg
  - [ ] Windows: https://github.com/mjlemay/blumbotron/releases/latest/download/blumbotron_x64_en-US.msi
  - [ ] Linux: https://github.com/mjlemay/blumbotron/releases/latest/download/blumbotron_amd64.deb
- [ ] Test downloading and installing on at least one platform
- [ ] Verify website displays correct version: https://mjlemay.github.io/blumbotron/

## Announcement

- [ ] Update any external links or documentation
- [ ] Announce release (social media, Discord, email list, etc.)

## If Something Breaks

- Delete the tag: `git push --delete origin vX.Y.Z && git tag -d vX.Y.Z`
- Fix the issue
- Run `npm run release` again (it will re-use the same version)
