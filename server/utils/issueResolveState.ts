// Tracks issue IDs that are currently being resolved with a comment,
// so the IssueCommentSubscriber can skip sending a duplicate notification.
const resolvingWithComment = new Set<number>();

export function markResolvingWithComment(issueId: number): void {
  resolvingWithComment.add(issueId);
}

export function clearResolvingWithComment(issueId: number): void {
  resolvingWithComment.delete(issueId);
}

export function isResolvingWithComment(issueId: number): boolean {
  return resolvingWithComment.has(issueId);
}
