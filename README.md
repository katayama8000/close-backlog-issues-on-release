# Create Backlog Document on Release

A GitHub Actions workflow that extracts Backlog issue keys (formatted as `WORKNULAB-XXXX`) from release notes, creates a Backlog Document, and posts comments to related issues when a GitHub Release is published.

---

## How It Works

1. **Trigger:** The workflow is triggered when a GitHub Release is **published**.
2. **Extraction:** It scans the release notes body for `WORKNULAB-\d+` patterns using regular expressions (duplicates are removed).
3. **Document:** It creates a Backlog Document under a fixed parent folder selected by release prefix (`web-` or `api-`).
4. **Comment:** It posts an English comment to each extracted issue.
5. **Notify:** It resolves configured users to Backlog user IDs, then passes them as `notifiedUserId[]` so those users receive notifications.

---

## Setup

### GitHub Secrets

Configure the following secrets in your repository under **Settings** → **Secrets and variables** → **Actions**:

| Secret            | Description           |
| :---------------- | :-------------------- |
| `BACKLOG_API_KEY` | Your Backlog API Key. |

### GitHub Variables

Configure the following repository variables in **Settings** → **Secrets and variables** → **Actions** → **Variables**:

| Variable               | Description                                                                                                                                                       |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BACKLOG_SPACE_NAME`   | Your Backlog space name (the `xxx` in `xxx.backlog.com`).                                                                                                         |
| `BACKLOG_PROJECT_ID`   | Backlog project ID used for document creation and project-user lookup.                                                                                            |
| `BACKLOG_NOTIFY_USERS` | Comma-separated notify targets. Each token is matched in this order: `mailAddress`, `userId`, `name` (exact match). Example: `katayama8000,tatsufumi@example.com` |

### Notes

- The workflow resolves notify targets from project users via `GET /api/v2/projects/{projectId}/users`.
- If a token cannot be resolved, it is skipped with a warning log.
- If no issue key is found in release notes, comment posting is skipped.
- `jq` is required in the runner environment (available on `ubuntu-latest`).

---

## Testing

Run the following command to execute the test suite locally:

```bash
npx tsx --test tests/close-backlog-issues.test.ts
```
