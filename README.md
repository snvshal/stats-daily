# Stats Daily

Stats Daily is a web application designed to help users track their daily tasks, set targets, and evaluate their work performance. By visualizing their progress and statistics, users can gain insights into their productivity and make necessary changes to improve.

Stats Daily ships with a built-in **MCP server (Model Context Protocol)** that AI agents like Claude Desktop can connect to via **OAuth 2.1 + PKCE** for secure, scoped access to your tasks, notes, and achievements.

## Table of Contents

- [Features](#features)
- [MCP Server Setup](#mcp-server-setup)
- [Scopes & Permissions](#scopes--permissions)
- [Installation](#installation)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication via Google (NextAuth)
- Daily task input and tracking
- Visualization of task completion statistics
- Clean and user-friendly interface
- OAuth 2.1 + PKCE protected MCP server for AI agent access

## MCP Server Setup

Stats Daily implements a [Model Context Protocol](https://modelcontextprotocol.io) server that uses **OAuth 2.1 with PKCE** for authorization. This allows MCP-enabled AI agents (Claude Desktop, Cursor, etc.) to securely access your data.

### How It Works

1. **Client Registration** — Clients register via [Dynamic Client Registration (RFC 7591)](https://datatracker.ietf.org/doc/html/rfc7591) at `POST /api/mcp/register`
2. **Authorization** — The user signs in with Google and is presented with a **consent screen** listing the scopes the client is requesting
3. **Token Exchange** — After approval, the client receives an authorization code, then exchanges it (with PKCE verification) for an access token and refresh token
4. **Tool Access** — The MCP client uses the access token to call tools via `POST /api/mcp`

### OAuth Endpoints

| Endpoint                                  | Method | Purpose                                  |
| ----------------------------------------- | ------ | ---------------------------------------- |
| `/.well-known/oauth-authorization-server` | GET    | Authorization server metadata (RFC 8414) |
| `/.well-known/oauth-protected-resource`   | GET    | Protected resource metadata              |
| `/api/mcp/register`                       | POST   | Dynamic client registration              |
| `/api/mcp/authorize`                      | GET    | Login + consent screen                   |
| `/api/mcp/authorize`                      | POST   | Submit consent decision                  |
| `/api/mcp/token`                          | POST   | Exchange code for tokens, refresh tokens |
| `/api/mcp`                                | POST   | MCP tool execution                       |

### Connecting MCP Clients

Clients that support **OAuth 2.1** (Claude Desktop, Cursor, etc.) connect directly using the MCP server URL:

```
Name: StatsDaily
MCP Server URL: http://localhost:3000/api/mcp
```

Your client will redirect you to sign in and approve the requested permissions when connecting.

## Scopes & Permissions

Each MCP tool requires a specific scope. The authorization server enforces scopes on every request.

### Available Scopes

**Areas**

- `mcp:areas:read` — Read areas, tasks, and area notes
- `mcp:areas:write` — Create or update areas and tasks

**Notes**

- `mcp:notes:read` — Read daily notes
- `mcp:notes:write` — Create or update daily notes

**Achievements**

- `mcp:achievements:read` — Read achievements
- `mcp:achievements:write` — Create achievements

### Default Scopes

If the client omits the `scope` parameter during authorization, the following scopes are granted by default:

```
mcp:areas:read mcp:notes:read mcp:achievements:read
```

### Scope Enforcement

- **Read tools** (e.g. `get_area`, `get_note`, `list_areas`) require the corresponding `:read` scope
- **Write tools** (e.g. `create_area`, `save_note`, `save_achievement`) require the corresponding `:write` scope
- Requests without the required scope return a **403 Forbidden** error
- When auth is disabled (`MCP_DISABLE_AUTH=true`), scope checks are skipped

### Available Tools

| Tool               | Required Scope           | Description                           |
| ------------------ | ------------------------ | ------------------------------------- |
| `list_areas`       | `mcp:areas:read`         | List all areas/topics                 |
| `get_area`         | `mcp:areas:read`         | Get a specific area by ID             |
| `create_area`      | `mcp:areas:write`        | Create a new area/topic               |
| `update_area_name` | `mcp:areas:write`        | Rename an area                        |
| `update_area_note` | `mcp:areas:write`        | Update area note                      |
| `update_task`      | `mcp:areas:write`        | Update a task                         |
| `add_task`         | `mcp:areas:write`        | Add a new task                        |
| `get_note`         | `mcp:notes:read`         | Get daily notes (optionally by date)  |
| `save_note`        | `mcp:notes:write`        | Save a daily note                     |
| `update_note`      | `mcp:notes:write`        | Append content to an existing note    |
| `get_achievements` | `mcp:achievements:read`  | Get achievements (optionally by date) |
| `save_achievement` | `mcp:achievements:write` | Save a new achievement                |

---

## Installation

To get started with the project, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/snvshal/stats-daily.git

   cd stats-daily
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes or improvements.

- Fork the repository
- Create a new branch
  ```bash
  git checkout -b feature-branch
  ```
- Commit your changes
  ```bash
  git commit -m 'Add new feature'
  ```
- Push to the branch
  ```bash
  git push origin feature-branch
  ```
- Open a pull request

---

## License

MIT
