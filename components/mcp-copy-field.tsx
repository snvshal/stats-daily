"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "lucide-react";

interface McpCopyFieldProps {
  label: string;
  value: string;
  description?: string;
}

export default function McpCopyField({
  label,
  value,
  description,
}: McpCopyFieldProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border/40 bg-muted/20 p-4 transition-colors duration-200 hover:bg-muted/30">
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <code className="flex-1 select-all overflow-x-auto whitespace-nowrap rounded border border-border/40 bg-background px-3 py-2.5 font-mono text-xs font-medium leading-none text-foreground">
          {value}
        </code>
        <button
          onClick={handleCopy}
          className="inline-flex flex-shrink-0 items-center justify-center rounded-md border border-border/50 bg-background p-2.5 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
          aria-label={`Copy ${label}`}
        >
          {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
        </button>
      </div>
      {description && (
        <p className="text-[11px] leading-normal text-muted-foreground/70">
          {description}
        </p>
      )}
    </div>
  );
}
