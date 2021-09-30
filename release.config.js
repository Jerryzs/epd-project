module.exports = {
  branches: ['main'],
  ci: false,
  dryRun: !!process.env.NO_RELEASE,
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/github',
    '@semantic-release/npm',
    [
      '@semantic-release/git',
      {
        message: 'chore(release): v<%= nextRelease.version %>',
      },
    ],
  ],
}
