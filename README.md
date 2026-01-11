# Stats Daily

Stats Daily is a web application designed to help users track their daily tasks, set targets, and evaluate their work performance. By visualizing their progress and statistics, users can gain insights into their productivity and make necessary changes to improve.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication
- Daily task input and tracking
- Visualization of task completion statistics
- Clean and user-friendly interface
- API Key management (create, revoke, scope-based access)
- MCP-compatible context endpoint for AI agents
<!-- - Secure, scoped, and revocable access -->

## MCP & API Access

Stats Daily exposes a **read-only MCP context API** that allows users to connect their data to AI agents (Claude, Cursor, custom agents, etc.).

<!-- ### Supported Scope
- `mcp:read` — read-only access to tasks, notes, and areas -->

### Authentication

All MCP requests are authenticated using **Bearer API keys**.

```http
Authorization: Bearer <API_KEY>
```

### MCP Context Endpoint

```http
GET /api/mcp/context
```

Returns:

- Areas
- Tasks
- Notes
- Last updated timestamps

---

## MCP Server (`@snvshal/sndo`)

Stats Daily provides an official **Model Context Protocol (MCP) server** that allows AI agents to securely access a user’s tasks and notes using API keys.

### Package

```bash
npx @snvshal/sndo
```

This MCP server communicates over **stdio** and is compatible with MCP-enabled clients such as Claude, Cursor, and custom agents.

---

## Setting Up MCP Access

### 1. Create an API Key

- Go to **API Keys**
- Create a new key

### 2. Configure Your MCP Client

Set your API key as an environment variable:

```bash
export SNDO_API_KEY=your_api_key_here
```

Or provide it directly in your MCP client configuration.

### 3. Example MCP Client Configuration

```json
{
  "mcpServers": {
    "sndo": {
      "command": "npx",
      "args": ["@snvshal/sndo"],
      "env": {
        "SNDO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## What Data Is Exposed

<!-- With the `mcp:read` scope, the MCP server can access: -->

- Areas
- Tasks
- Notes
- Last updated timestamps

Access is **read-only**, scoped, and can be revoked at any time.

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
