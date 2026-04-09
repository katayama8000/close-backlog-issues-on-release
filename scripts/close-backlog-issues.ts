const BACKLOG_STATUS_CLOSED = 4;

export function extractPastaIssueKeys(body: string): string[] {
  const matches = body.match(/WORKNULAB-\d+/g);
  if (!matches) return [];
  return [...new Set(matches)];
}

type CloseResult =
  | { ok: true; issueKey: string }
  | { ok: false; issueKey: string; error: string };

export function extractVersion(releaseTitle: string): string | null {
  const match = releaseTitle.match(/\d+\.\d+\.\d+/);
  return match ? match[0] : null;
}

async function addComment(
  issueKey: string,
  spaceName: string,
  apiKey: string,
  content: string,
): Promise<{ ok: boolean; error?: string }> {
  const url = `https://${spaceName}.backlog.com/api/v2/issues/${issueKey}/comments?apiKey=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ content }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: `${res.status}: ${text}` };
  }

  return { ok: true };
}

export async function closeBacklogIssue(
  issueKey: string,
  spaceName: string,
  apiKey: string,
  version: string | null,
): Promise<CloseResult> {
  if (version) {
    const comment = await addComment(
      issueKey,
      spaceName,
      apiKey,
      `Released in ${version}`,
    );
    if (!comment.ok) {
      return { ok: false, issueKey, error: `comment failed: ${comment.error}` };
    }
  }

  const url = `https://${spaceName}.backlog.com/api/v2/issues/${issueKey}?apiKey=${apiKey}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ statusId: String(BACKLOG_STATUS_CLOSED) }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, issueKey, error: `${res.status}: ${text}` };
  }

  return { ok: true, issueKey };
}

export async function main() {
  const releaseBody = process.env.RELEASE_BODY ?? '';
  const releaseTitle = process.env.RELEASE_TITLE ?? '';
  const spaceName = process.env.BACKLOG_SPACE_NAME;
  const apiKey = process.env.BACKLOG_API_KEY;
  const version = extractVersion(releaseTitle);

  if (!spaceName || !apiKey) {
    console.error('BACKLOG_SPACE_NAME and BACKLOG_API_KEY are required');
    process.exit(1);
  }

  const issueKeys = extractPastaIssueKeys(releaseBody);

  if (issueKeys.length === 0) {
    console.log('No WORKNULAB issue keys found in release body.');
    return;
  }

  console.log(`Found issue keys: ${issueKeys.join(', ')}`);

  const results: CloseResult[] = [];
  for (const key of issueKeys) {
    console.log(`Closing ${key}...`);
    const result = await closeBacklogIssue(key, spaceName, apiKey, version);
    results.push(result);
  }

  const succeeded = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);

  console.log(`\nResults: ${succeeded.length} closed, ${failed.length} failed`);
  for (const r of failed) {
    if (!r.ok) console.error(`  FAILED: ${r.issueKey} — ${r.error}`);
  }

  if (failed.length > 0) process.exit(1);
}

import { fileURLToPath } from 'node:url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
