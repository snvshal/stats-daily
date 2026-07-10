const SCOPE_LABELS: Record<string, string> = {
  "mcp:areas:read": "Read your areas and tasks",
  "mcp:areas:write": "Create and update areas and tasks",
  "mcp:notes:read": "Read your daily notes",
  "mcp:notes:write": "Save and update daily notes",
  "mcp:achievements:read": "Read your achievements",
  "mcp:achievements:write": "Save achievements",
};

export function renderConsentPage(params: {
  clientName: string;
  scopes: string[];
  postUrl: string;
  consentToken: string;
  denyUrl: string;
  userEmail?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Authorize — StatsDaily</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #1a1a1a;
    --text-secondary: #666666;
    --border: #e5e7eb;
    --accent: #000000;
    --accent-hover: #333333;
    --success: #10b981;
    --success-bg: #ecfdf5;
    --success-text: #047857;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0f0f0f;
      --bg-secondary: #1a1a1a;
      --text-primary: #ffffff;
      --text-secondary: #a0a0a0;
      --border: #2d2d2d;
      --accent: #ffffff;
      --accent-hover: #e0e0e0;
      --success: #10b981;
      --success-bg: #064e3b;
      --success-text: #6ee7b7;
    }
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    width: 100%;
    height: 100%;
  }

  body {
    font-family: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: var(--bg);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    min-height: 100dvh;
  }

  .container {
    width: 100%;
    max-width: 480px;
  }

  .card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 40px 32px;
  }

  .header {
    margin-bottom: 32px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1.5rem;
    font-weight: 700;
    box-sizing: border-box;
  }

  .logo-text {
    font-size: 1.5rem;
    font-weight: 700;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
  }

  .subtitle {
    font-size: 0.95rem;
    color: var(--text-secondary);
    margin-bottom: 28px;
    line-height: 1.5;
  }

  .permissions-section {
    margin-bottom: 32px;
  }

  .permissions-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
  }

  .permissions-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .permission-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.9rem;
    color: var(--text-primary);
  }

  .permission-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    color: var(--success);
  }

  .user-info {
    padding: 12px 14px;
    background: var(--bg-secondary);
    border-radius: 8px;
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 32px;
    text-align: center;
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin-bottom: 32px;
  }

  .actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .btn {
    flex: 1;
    min-width: 120px;
    padding: 12px 20px;
    border-radius: 8px;
    border: 1px solid transparent;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .btn:active {
    transform: scale(0.98);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-color: transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    vertical-align: middle;
    margin-right: 6px;
  }

  .btn-primary {
    background: var(--accent);
    color: var(--bg);
    font-weight: 600;
  }

  .btn-primary:hover {
    background: var(--accent-hover);
  }

  .btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-color: var(--border);
  }

  .btn-secondary:hover {
    background: var(--border);
  }

  @media (max-width: 480px) {
    .card {
      padding: 32px 24px;
    }

    h1 {
      font-size: 1.3rem;
    }

    .actions {
      flex-direction: column;
    }

    .btn {
      width: 100%;
    }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">
          <code class="logo-icon">SD</code>
          <span class="logo-text">StatsDaily</span>
        </div>
        <h1>Authorize access</h1>
        <p class="subtitle">${escapeHtml(params.clientName)} needs permission to access your account</p>
      </div>

      <div class="permissions-section">
        <div class="permissions-label">Permissions</div>
        <ul class="permissions-list">
          ${params.scopes
            .map(
              (s) => `
            <li class="permission-item">
              <svg class="permission-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6.5 9 17.5 4 12.5"></polyline>
              </svg>
              <span>${escapeHtml(SCOPE_LABELS[s] ?? s)}</span>
            </li>
          `,
            )
            .join("")}
        </ul>
      </div>

      ${
        params.userEmail
          ? `
        <div class="user-info">
          Signed in as <strong>${escapeHtml(params.userEmail)}</strong>
        </div>
      `
          : ""
      }

      <form id="approveForm" method="post" action="${escapeHtml(params.postUrl)}" style="display: contents;">
        <input type="hidden" name="consent_token" value="${params.consentToken}">
        <div class="actions">
          <a href="${escapeHtml(params.denyUrl)}" class="btn btn-secondary">Deny</a>
          <button id="approveBtn" type="submit" class="btn btn-primary">Approve</button>
        </div>
      </form>
    </div>
  </div>
<script>
  document.getElementById("approveForm").addEventListener("submit", function() {
    var btn = document.getElementById("approveBtn");
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Approving\u2026';
  });
</script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
