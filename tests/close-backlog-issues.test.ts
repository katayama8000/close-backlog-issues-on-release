import { describe, it } from 'node:test';
import { strict } from 'node:assert';
import { extractPastaIssueKeys } from '../scripts/close-backlog-issues';

describe('extractPastaIssueKeys', () => {
  it('extracts MOUFU issue keys from release body', () => {
    const body = `
## What's Changed
* MOUFU-1001 add user profile page by @user-a in #101
* MOUFU-1002 fix login validation by @user-b in #102
* OTHER-500 update CI config by @user-c in #103
* MOUFU-1003 improve search performance by @user-d in #104
* MISC-200 bump dependencies by @user-e in #105
    `;
    strict.deepStrictEqual(extractPastaIssueKeys(body), [
      'MOUFU-1001',
      'MOUFU-1002',
      'MOUFU-1003',
    ]);
  });

  it('returns empty array for empty string', () => {
    strict.deepStrictEqual(extractPastaIssueKeys(''), []);
  });

  it('deduplicates issue keys', () => {
    const body = 'MOUFU-1001 and again MOUFU-1001 and MOUFU-1002';
    strict.deepStrictEqual(extractPastaIssueKeys(body), [
      'MOUFU-1001',
      'MOUFU-1002',
    ]);
  });

  it('ignores non-MOUFU keys', () => {
    const body = 'OTHER-100 MOUFU-1001 MISC-200';
    strict.deepStrictEqual(extractPastaIssueKeys(body), ['MOUFU-1001']);
  });

  it('handles body with no issue keys', () => {
    const body = "## What's Changed\n* chore: update dependencies";
    strict.deepStrictEqual(extractPastaIssueKeys(body), []);
  });
});
