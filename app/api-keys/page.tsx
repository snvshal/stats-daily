"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CopyIcon,
  PlusIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  LoaderIcon,
  TrashIcon,
  KeyIcon,
} from "lucide-react";
import { TitleHeader } from "@/components/daily-note";
import { format } from "date-fns";

type ApiKey = {
  _id: string;
  name: string;
  scopes: string[];
  revoked: boolean;
  createdAt: string;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadKeys() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/api-keys");

      if (!res.ok) {
        throw new Error("Failed to load API keys");
      }

      const data: ApiKey[] = await res.json();
      const fkeys = data.filter((d) => !d.revoked);
      setKeys(fkeys);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load API keys");
      console.error("Error loading keys:", err);
    } finally {
      setLoading(false);
    }
  }

  async function revokeKey(id: string) {
    try {
      const res = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });

      if (!res.ok) {
        throw new Error("Failed to revoke API key");
      }

      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke API key");
      console.error("Error revoking key:", err);
    }
  }

  useEffect(() => {
    loadKeys();
  }, []);

  return (
    <TitleHeader
      page="API Keys"
      actionItem={
        <CreateAPIKeyDialog onKeyCreated={loadKeys} existingKeys={keys} />
      }
    >
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* API Keys List */}
      <div className="space-y-4 p-4 md:p-6">
        {loading ? (
          <div className="flex-center h-[calc(100dvh-8rem)]">
            <LoaderIcon className="animate-spin" />
          </div>
        ) : keys.length === 0 ? (
          <Card className="border-dashed">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <KeyIcon className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">No API keys yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by creating your first API key
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {keys.map((key) => (
              <Card key={key._id} className="transition-shadow hover:shadow-md">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex flex-1 items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12">
                      <KeyIcon className="h-6 w-6" />
                    </div>

                    <div className="flex-1 space-y-2 sm:space-y-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="text-base font-semibold sm:text-lg">
                          {key.name}
                        </h3>
                        {key.revoked ? (
                          <Badge variant="destructive">Revoked</Badge>
                        ) : (
                          <Badge
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        Created on{" "}
                        {format(
                          new Date(key.createdAt),
                          "MMMM do, yyyy, h:mm a",
                        )}
                      </p>
                    </div>
                  </div>

                  {!key.revoked && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revokeKey(key._id)}
                      className="ml-auto w-fit gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground sm:ml-0"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span className="sm:inline">Revoke</span>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TitleHeader>
  );
}

function CreateAPIKeyDialog({
  onKeyCreated,
  existingKeys,
}: {
  onKeyCreated: () => void;
  existingKeys: ApiKey[];
}) {
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDuplicateName = existingKeys.some(
    (key) =>
      key.name.toLowerCase() === name.trim().toLowerCase() && !key.revoked,
  );

  async function createKey() {
    if (!name.trim()) return;

    // Check for duplicate names
    if (isDuplicateName) {
      setError("An API key with this name already exists");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create API key");
      }

      const data = await res.json();
      setNewKey(data.apiKey);
      setName("");
      onKeyCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create API key");
      console.error("Error creating key:", err);
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function resetDialogState() {
    setNewKey(null);
    setName("");
    setCopied(false);
    setError(null);
  }

  function handleOpenChange(open: boolean) {
    setDialogOpen(open);
    // Reset all values when dialog closes (including blur, ESC key, or X button)
    if (!open) {
      resetDialogState();
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusIcon className="h-5 w-5" />
          Create API Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New API Key</DialogTitle>
          <DialogDescription>
            Enter a name for your new API key. This will help you identify it
            later.
          </DialogDescription>
        </DialogHeader>

        {!newKey ? (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  id="name"
                  placeholder="Enter API key name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createKey()}
                  className={`h-10 ${isDuplicateName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {isDuplicateName && (
                  <p className="text-sm text-destructive">
                    This name is already in use
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="max-sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetDialogState();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={createKey}
                disabled={loading || !name.trim() || isDuplicateName}
              >
                {loading ? "Creating..." : "Create Key"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangleIcon className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <AlertDescription className="text-amber-900 dark:text-amber-200">
                <p className="font-semibold">Save this key now!</p>
                <p className="text-sm">
                  You won't be able to see it again after closing this dialog.
                </p>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  readOnly
                  value={newKey}
                  className="h-10 font-mono text-sm"
                />
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => copyToClipboard(newKey)}
              >
                {copied ? (
                  <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )}
              </Button>
            </div>

            <DialogFooter>
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  resetDialogState();
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
