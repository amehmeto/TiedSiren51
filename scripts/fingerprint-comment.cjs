/**
 * Manage the fingerprint skip comment on a PR.
 *
 * Called from actions/github-script with { github, context } plus
 * a `nativeChanged` boolean injected by the workflow.
 *
 * - nativeChanged === false → create/update a "build skipped" comment
 * - nativeChanged === true  → delete any existing skip comment
 */
module.exports = async ({ github, context, nativeChanged }) => {
  const marker = '<!-- fingerprint-skip-comment -->'

  const { data: comments } = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
  })
  const existing = comments.find((c) => c.body.includes(marker))

  if (!nativeChanged) {
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
