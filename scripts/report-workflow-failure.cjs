/**
 * Post a failure comment on the issue that triggered a workflow.
 * Called from actions/github-script in hephaestus.yml.
 *
 * @param {object} params
 * @param {object} params.github - Octokit instance
 * @param {object} params.context - GitHub Actions context
 * @param {string} params.runUrl - Full URL to the failed workflow run
 */
module.exports = async ({ github, context, runUrl }) => {
  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.payload.issue.number,
    body: `⚠️ Failed to start Claude Code session. Check the [workflow run](${runUrl}) for details.`,
  })
}
