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
import { TitleHeader } from "../daily-note";

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
      router.back();
    } catch (error) {
      alert("Error saving note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !editor) return null;

  return (
    <TitleHeader
      page={format(new Date(), "MMMM d, yyyy")}
      actionItem={
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      }
    >
      <div className="mx-auto max-w-3xl bg-background md:p-4">
        <div className="relative h-[calc(100dvh-7.1rem)] md:h-[calc(100dvh-9rem)]">
          <div className="sticky top-0 z-20 flex border-b bg-background p-2 max-md:w-screen md:rounded-t-lg md:border">
            <EditorBlockTools editor={editor} />
          </div>
          <ScrollArea
            onClick={() => editor.view.focus()}
            className="relative h-full rounded-b-lg bg-card p-4 md:border md:border-t-0"
          >
            <EditorContent
              editor={editor}
              className="h-full w-full py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-4"
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
    </TitleHeader>
  );
}
