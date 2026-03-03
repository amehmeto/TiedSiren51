/**
 * Manage the fingerprint skip comment on a PR.
 *
 * Called from actions/github-script with { github, context } plus
 * the raw `nativeChanged` step output string.
 *
 * - nativeChanged !== 'false' → delete any existing skip comment
 * - nativeChanged === 'false' → create/update a "build skipped" comment
 */
module.exports = async ({ github, context, nativeChanged }) => {
  const hasNativeChanges = nativeChanged !== 'false'
  const marker = '<!-- fingerprint-skip-comment -->'

  const { data: comments } = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
  })
  const existing = comments.find((c) => c.body.includes(marker))

  if (!hasNativeChanges) {
    const body = [
      marker,
      '**Build skipped** — no native changes detected by Expo fingerprint.',
      '',
      'Only JS/TS files changed in this PR. The Android APK build was skipped.',
      'If you believe this is incorrect, push a no-op change to `app.json` or `app.config.ts` to force a rebuild.',
    ].join('\n')

    if (existing) {
      await github.rest.issues.updateComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: existing.id,
        body,
      })
    } else {
      await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        body,
      })
    }
  } else if (existing) {
    await github.rest.issues.deleteComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: existing.id,
    })
  }
}
