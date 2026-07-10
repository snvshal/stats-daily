export function renderConsentPage(params: {
  clientName: string;
  scopes: string[];
  postUrl: string;
  consentToken: string;
  denyUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Authorize — StatsDaily</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --border: 240 5.9% 90%;
    --radius: 0.5rem;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --background: 240 10% 3.9%;
      --foreground: 0 0% 98%;
      --card: 240 10% 3.9%;
      --card-foreground: 0 0% 98%;
      --muted: 240 3.7% 15.9%;
      --muted-foreground: 240 5% 64.9%;
      --primary: 0 0% 98%;
      --primary-foreground: 240 5.9% 10%;
      --secondary: 240 3.7% 15.9%;
      --secondary-foreground: 0 0% 98%;
      --border: 240 3.7% 15.9%;
    }
  }
  *{margin:0;padding:0;box-sizing:border-box}
  body{
    font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;
    background:hsl(var(--background));
    color:hsl(var(--foreground));
    min-height:100dvh;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:16px;
  }
  .card{
    background:hsl(var(--card));
    border:1px solid hsl(var(--border));
    border-radius:1rem;
    box-shadow:0 4px 6px -1px rgb(99 102 241 / 0.25);
    padding:32px;
    width:100%;
    max-width:420px;
  }
  .logo{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:10px;
    margin-bottom:24px;
  }
  .logo-icon{
    display:flex;
    align-items:center;
    justify-content:center;
    width:36px;
    height:36px;
    border-radius:var(--radius);
    font-size:1.1rem;
    font-weight:700;
    border:1px solid hsl(var(--border));
  }
  .logo-text{
    font-size:1.25rem;
    font-weight:700;
  }
  h1{
    text-align:center;
    font-size:1.15rem;
    font-weight:600;
    margin-bottom:4px;
  }
  .client{
    text-align:center;
    font-size:.85rem;
    color:hsl(var(--muted-foreground));
    margin-bottom:20px;
  }
  ul{
    list-style:none;
    padding:0;
    margin-bottom:24px;
    display:flex;
    flex-direction:column;
    gap:8px;
  }
  li{
    font-size:.9rem;
    padding:8px 12px;
    background:hsl(var(--muted));
    border-radius:calc(var(--radius) - 2px);
    font-family:monospace;
    font-size:.82rem;
  }
  .actions{
    display:flex;
    gap:10px;
  }
  .btn{
    flex:1;
    padding:10px 0;
    border-radius:var(--radius);
    border:1px solid transparent;
    font-size:.9rem;
    font-weight:500;
    cursor:pointer;
    text-align:center;
    text-decoration:none;
    display:inline-block;
    transition:opacity .15s;
  }
  .btn:active{opacity:.8}
  .btn-primary{
    background:hsl(var(--primary));
    color:hsl(var(--primary-foreground));
  }
  .btn-primary:hover{opacity:.9}
  .btn-secondary{
    background:transparent;
    border-color:hsl(var(--border));
    color:hsl(var(--foreground));
  }
  .btn-secondary:hover{background:hsl(var(--secondary))}
</style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <span class="logo-icon">SD</span>
      <span class="logo-text">StatsDaily</span>
    </div>
    <h1>Authorize access</h1>
    <p class="client">${escapeHtml(params.clientName)} wants to:</p>
    <ul>${params.scopes.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
    <form method="post" action="${escapeHtml(params.postUrl)}">
      <input type="hidden" name="consent_token" value="${params.consentToken}">
      <div class="actions">
        <a href="${escapeHtml(params.denyUrl)}" class="btn btn-secondary">Deny</a>
        <button type="submit" class="btn btn-primary">Approve</button>
      </div>
    </form>
  </div>
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
