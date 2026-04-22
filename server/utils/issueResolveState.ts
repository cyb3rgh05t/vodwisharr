// Tracks issue IDs that are currently being resolved with a comment,
// so the IssueCommentSubscriber can skip sending a duplicate notification.
const resolvingWithComment = new Set<number>();

// Keep the flag alive long enough for the async subscriber DB queries to complete.
const RESOLVE_FLAG_TTL = 5000;

export function markResolvingWithComment(issueId: number): void {
  resolvingWithComment.add(issueId);
  setTimeout(() => resolvingWithComment.delete(issueId), RESOLVE_FLAG_TTL);
}

export function isResolvingWithComment(issueId: number): boolean {
  return resolvingWithComment.has(issueId);
}
