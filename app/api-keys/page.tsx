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
  SettingsIcon,
} from "lucide-react";
import { TitleHeader } from "@/components/daily-note";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { ALLOWED_SCOPES, BASE_SCOPES, Scope } from "@/lib/route/constants";
import { SetState } from "@/lib/types";
import Link from "next/link";

type ApiKey = {
  _id: string;
  name: string;
  scopes: Scope[];
  revoked: boolean;
  createdAt: string;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  function openPermissionsDialog(key: ApiKey) {
    setSelectedKey(key);
    setDialogOpen(true);
  }

  useEffect(() => {
    loadKeys();
  }, []);

  return (
    <TitleHeader
      page="API Keys"
      actionItem={
        <div className="flex items-end gap-2">
          <Button variant="outline">
            <Link href="/api-keys/usage">Usage</Link>
          </Button>
          <CreateAPIKeyDialog onKeyCreated={loadKeys} existingKeys={keys} />
        </div>
      }
    >
      <div className="space-y-4 p-4 md:p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
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
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-6">
                  <div className="flex flex-1 items-center gap-3 sm:gap-4">
                    <div className="m-1 flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-lg sm:h-12 sm:w-12">
                      <KeyIcon className="h-6 w-6" />
                    </div>

                    <div className="flex-1 space-y-2 sm:space-y-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="max-w-40 truncate text-base font-semibold sm:max-w-xs sm:text-lg">
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

                      {key.scopes.filter(
                        (scope) => !BASE_SCOPES.includes(scope),
                      ).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {key.scopes
                            .filter((scope) => !BASE_SCOPES.includes(scope))
                            .map((scope) => (
                              <Badge
                                key={scope}
                                variant="secondary"
                                className="text-xs tracking-wide"
                              >
                                {scope}
                              </Badge>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => openPermissionsDialog(key)}
                      className="hover:bg-muted"
                    >
                      <SettingsIcon className="h-4 w-4" />
                    </Button>

                    {!key.revoked && (
                      <Button
                        variant="outline"
                        onClick={() => revokeKey(key._id)}
                        className="w-fit gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sm:inline">Revoke</span>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ApiKeyPermissionsDialog
        keyData={selectedKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUpdated={loadKeys}
      />
    </TitleHeader>
  );
}

function ApiKeyPermissionsDialog({
  keyData,
  open,
  onOpenChange,
  onUpdated,
}: {
  keyData: ApiKey | null;
  open: boolean;
  onOpenChange: SetState<boolean>;
  onUpdated: () => void;
}) {
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [initialScopes, setInitialScopes] = useState<Scope[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && keyData) {
      setScopes(keyData.scopes);
      setInitialScopes(keyData.scopes);
      setError(null);
    }
  }, [open, keyData]);

  const hasChanges =
    scopes.length !== initialScopes.length ||
    scopes.some((s) => !initialScopes.includes(s));

  async function save() {
    if (!keyData || !hasChanges) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/api-keys/permission", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKeyId: keyData._id,
          scopes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update permissions");
      }

      onUpdated();
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating permissions:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen && !saving) {
      setScopes(initialScopes);
    }
    onOpenChange(nextOpen);
    setError(null);
  }

  if (!keyData) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Key Permissions</DialogTitle>
          <DialogDescription>
            Configure permissions for "{keyData.name}"
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {ALLOWED_SCOPES.filter((scope) => !BASE_SCOPES.includes(scope)).map(
            (scope) => (
              <label
                key={scope}
                className="flex cursor-pointer items-center gap-2"
              >
                <Checkbox
                  disabled={saving}
                  checked={scopes.includes(scope)}
                  onCheckedChange={(v) =>
                    setScopes((s) =>
                      v ? [...s, scope] : s.filter((x) => x !== scope),
                    )
                  }
                />
                <span className="text-sm tracking-wide">{scope}</span>
              </label>
            ),
          )}
        </div>

        <DialogFooter className="max-sm:gap-2">
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => handleClose(false)}
          >
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || !hasChanges}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
