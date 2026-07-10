import { Metadata } from "next";
import { SDIconWithTitle, PageFooter } from "@/components/home-page";
import McpCopyField from "@/components/mcp-copy-field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "MCP Guide — StatsDaily",
  description:
    "Connect StatsDaily to any MCP-compatible AI client. Learn about available tools, permissions, and how to set up the connection.",
  openGraph: {
    title: "MCP Guide — StatsDaily",
    description:
      "Connect StatsDaily to any MCP-compatible AI client. Learn about available tools, permissions, and how to set up the connection.",
    siteName: "StatsDaily",
    type: "website",
    images: [{ url: "/mcp-oauth.png" }],
  },
  twitter: {
    title: "MCP Guide — StatsDaily",
    description:
      "Connect StatsDaily to any MCP-compatible AI client. Learn about available tools, permissions, and how to set up the connection.",
    images: ["/mcp-oauth.png"],
  },
};

const SCOPES = [
  { scope: "mcp:areas:read", label: "Read your areas and tasks" },
  { scope: "mcp:areas:write", label: "Create and update areas and tasks" },
  { scope: "mcp:notes:read", label: "Read your daily notes" },
  { scope: "mcp:notes:write", label: "Save and update daily notes" },
  { scope: "mcp:achievements:read", label: "Read your achievements" },
  { scope: "mcp:achievements:write", label: "Save achievements" },
];

const TOOLS = [
  {
    name: "list_areas",
    description: "List all areas/topics",
    scope: "mcp:areas:read",
  },
  {
    name: "get_area",
    description: "Get a specific area by ID",
    scope: "mcp:areas:read",
  },
  {
    name: "create_area",
    description: "Create a new area/topic",
    scope: "mcp:areas:write",
  },
  {
    name: "update_area_name",
    description: "Rename an area",
    scope: "mcp:areas:write",
  },
  {
    name: "update_area_note",
    description: "Update the note for an area",
    scope: "mcp:areas:write",
  },
  {
    name: "update_task",
    description: "Update a task within an area",
    scope: "mcp:areas:write",
  },
  {
    name: "add_task",
    description: "Add a new task to an area",
    scope: "mcp:areas:write",
  },
  {
    name: "get_note",
    description: "Get daily notes, optionally filtered by date",
    scope: "mcp:notes:read",
  },
  {
    name: "save_note",
    description: "Save a daily note (supports HTML) — replaces today's note",
    scope: "mcp:notes:write",
  },
  {
    name: "update_note",
    description: "Append content to an existing note by ID (supports HTML)",
    scope: "mcp:notes:write",
  },
  {
    name: "get_achievements",
    description: "Get achievements, optionally filtered by date",
    scope: "mcp:achievements:read",
  },
  {
    name: "save_achievement",
    description: "Save a new achievement for today",
    scope: "mcp:achievements:write",
  },
];

export default function McpGuidePage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      <header className="border-b">
        <div className="flex-between mx-auto h-14 w-full max-w-7xl shrink-0 border-x px-4 md:px-6">
          <SDIconWithTitle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 border-x px-4 py-12 md:px-6">
        <div className="mx-auto max-w-4xl space-y-12">
          <section className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Connect with MCP
            </h1>
            <p className="leading-relaxed text-muted-foreground">
              Allow AI agents to securely read and write your StatsDaily data
              using the Model Context Protocol.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Connection</h2>
            <div className="space-y-3">
              <McpCopyField label="Name" value="StatsDaily" />
              <McpCopyField
                label="MCP Server URL"
                value={`${process.env.MCP_BASE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/mcp`}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              When your client connects, you will be redirected to sign in and
              approve the requested permissions via OAuth 2.1.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">
              Permissions (Scopes)
            </h2>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scope</TableHead>
                    <TableHead className="min-w-[200px]">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SCOPES.map((s) => (
                    <TableRow key={s.scope}>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                          {s.scope}
                        </code>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.label}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">
              Available Tools
            </h2>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool</TableHead>
                    <TableHead className="min-w-[200px]">Description</TableHead>
                    <TableHead>Required Scope</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TOOLS.map((t) => (
                    <TableRow key={t.name}>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                          {t.name}
                        </code>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.description}
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                          {t.scope}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">How it works</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/50 bg-muted/20 p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    1
                  </span>
                  <span className="text-sm font-medium">Add server URL</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Paste the MCP server URL into your AI client's MCP
                  configuration.
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/20 p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    2
                  </span>
                  <span className="text-sm font-medium">Client connects</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Your client connects and requests permissions for the tools it
                  needs.
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/20 p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    3
                  </span>
                  <span className="text-sm font-medium">Review & grant</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Sign in and review which tools the client can access, then
                  grant permissions.
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/20 p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    4
                  </span>
                  <span className="text-sm font-medium">Start using</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Once approved, your AI agent can read and write your
                  StatsDaily data.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              Your AI agent gains read and write access to the data you approve
              scopes for. Only connect from clients you trust.
            </p>
          </section>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
