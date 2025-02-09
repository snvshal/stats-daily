"use client";

import { useState, useEffect } from "react";
import { EditorContent } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { useRouter } from "next/navigation";
import { EditorBlockTools, EditorToolBar } from "./toolbar";
import { format } from "date-fns";
import { LinkPopover } from "./features";
import { useEditorConfiguration } from "./hooks";

export default function EditorComponent({
  content,
  noteId,
}: {
  noteId: string | null;
  content: string;
}) {
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  const editor = useEditorConfiguration({ content });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    if (!editor) {
      alert("Please provide content.");
      return;
    }
    const content = editor.getHTML();
    // if (!content || content.replace(/<[^>]*>/g, "").trim().length === 0) {
    //   alert("Please add some content before saving");
    //   return;
    // }
    setSaving(true);
    try {
      const response = await fetch("/api/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, content }),
      });
      if (!response.ok) {
        console.error("Error saving content");
      }
      const today = new Date();
      router.push(`/notes/${today.toISOString().split("T")[0]}`);
    } catch (error) {
      alert("Error saving note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !editor) return null;

  return (
    <div className="mx-auto box-border h-screen max-w-4xl bg-background p-4">
      <header className="flex-between mb-4">
        <p className="text-2xl font-bold">
          {format(new Date(), "MMMM d, yyyy")}
        </p>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </header>
      <div className="h-[calc(100%-4rem)]">
        <ScrollArea
          onClick={() => editor.view.focus()}
          className="relative h-full cursor-text rounded-lg border bg-card"
        >
          <div className="overflow-auto border-b p-2">
            <EditorBlockTools editor={editor} />
          </div>
          <EditorContent
            editor={editor}
            className="size-full p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <EditorToolBar editor={editor} />
          <LinkPopover editor={editor} />
        </ScrollArea>
        {/* <div className="flex items-center gap-4 p-1 text-xs text-muted-foreground">
          <span>{editor?.storage.characterCount.words() ?? 0} words</span>
          <span>
            {editor?.storage.characterCount.characters() ?? 0} characters
          </span>
        </div> */}
      </div>
    </div>
  );
}
