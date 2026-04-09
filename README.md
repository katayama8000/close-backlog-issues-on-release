# Close Backlog Issues on Release

A GitHub Actions workflow that automatically extracts Backlog issue keys (formatted as `MOUFU-XXXX`) from release notes and updates their status to **"Completed"** when a GitHub Release is published.

---

## How It Works

1. **Trigger:** The workflow is triggered when a GitHub Release is **published**.
2. **Extraction:** It scans the release notes body for `MOUFU-\d+` patterns using regular expressions (duplicates are removed).
3. **Update:** It calls the Backlog API (`PATCH /api/v2/issues/{key}`) to set `statusId=4` (Completed) for each identified issue.

---

## Setup

### GitHub Secrets

Configure the following secrets in your repository under **Settings** → **Secrets and variables** → **Actions**:

| Secret               | Description                                               |
| :------------------- | :-------------------------------------------------------- |
| `BACKLOG_SPACE_NAME` | Your Backlog space name (the `xxx` in `xxx.backlog.com`). |
| `BACKLOG_API_KEY`    | Your Backlog API Key.                                     |

---

## Testing

Run the following command to execute the test suite locally:

```bash
npx tsx --test tests/close-backlog-issues.test.ts
```
