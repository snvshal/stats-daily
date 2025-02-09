"use client";

import { useState, useCallback, useEffect } from "react";
import { Editor } from "@tiptap/core";
import { usePopper } from "react-popper";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import {
  AlignCenterButton,
  AlignLeftButton,
  AlignRightButton,
  BoldButton,
  CodeButton,
  FontFamilyButton,
  FontSizeButton,
  HeadingLevel1Button,
  HeadingLevel2Button,
  HeadingLevel3Button,
  HighlightButton,
  HorizontalLineButton,
  ItalicButton,
  LineBreakButton,
  LinkButton,
  ListButton,
  ListOrderedButton,
  StrikeButton,
  TextColorButton,
  UnderlineButton,
} from "./toolbar-items";

export function EditorToolBar({ editor }: { editor: Editor }) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showToolbar, setShowToolbar] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null,
  );
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "top-start",
    modifiers: [
      { name: "offset", options: { offset: [0, 8] } },
      { name: "flip", options: { fallbackPlacements: ["bottom-start"] } },
    ],
  });

  const updateToolbarVisibility = useCallback(() => {
    if (!editor) return;

    const selection = editor.view.state.selection;
    const isVisible = editor.view.hasFocus() && !selection.empty;

    if (isVisible) {
      const { from, to } = selection;
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);

      // Create a more accurate reference element
      const referenceEl = document.createElement("div");
      referenceEl.style.position = "absolute";
      referenceEl.style.left = `${start.left}px`;
      referenceEl.style.top = `${start.top}px`;
      referenceEl.style.width = `${end.right - start.left}px`;
      referenceEl.style.height = `${end.bottom - start.top}px`;
      document.body.appendChild(referenceEl);

      setReferenceElement(referenceEl);
      setShowToolbar(true);

      // Clean up the temporary element after the popper has been positioned
      setTimeout(() => {
        document.body.removeChild(referenceEl);
      }, 0);

      // Check if the selected text is a link
      const linkMark = editor.view.state.doc
        .nodeAt(from)
        ?.marks.find((mark) => mark.type.name === "link");
      if (linkMark) {
        setLinkUrl(linkMark.attrs.href);
      } else {
        setLinkUrl("");
      }
    } else {
      setShowToolbar(false);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const handleBlur = ({ event }: { event: FocusEvent }) => {
      const relatedTarget = event.target as Node;

      if (
        popperElement &&
        (popperElement.contains(relatedTarget) ||
          editor.view.dom.contains(relatedTarget))
      ) {
        return;
      }

      setShowToolbar(false);
    };

    editor.on("selectionUpdate", updateToolbarVisibility);
    editor.on("focus", updateToolbarVisibility);
    editor.on("blur", handleBlur);

    return () => {
      editor.off("selectionUpdate", updateToolbarVisibility);
      editor.off("focus", updateToolbarVisibility);
      editor.off("blur", handleBlur);
    };
  }, [editor, updateToolbarVisibility, popperElement]);

  if (!editor) return null;

  return (
    <>
      {showToolbar && (
        <div
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          className="z-50 flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2 shadow-sm"
        >
          <ScrollArea className="h-8 w-80 sm:w-96 lg:w-auto">
            <div className="flex-start gap-1">
              <BoldButton editor={editor} />
              <ItalicButton editor={editor} />
              <UnderlineButton editor={editor} />
              <FontFamilyButton editor={editor} />
              <FontSizeButton editor={editor} />
              <StrikeButton editor={editor} />
              <CodeButton editor={editor} />
              <TextColorButton editor={editor} />
              <HighlightButton editor={editor} />
              <LinkButton
                editor={editor}
                linkUrl={linkUrl}
                setLinkUrl={setLinkUrl}
              />
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        </div>
      )}
    </>
  );
}

export function EditorBlockTools({ editor }: { editor: Editor }) {
  if (!editor) return null;

  return (
    <ScrollArea className="w-full">
      <div className="flex flex-wrap gap-2">
        <HeadingLevel1Button editor={editor} />
        <HeadingLevel2Button editor={editor} />
        <HeadingLevel3Button editor={editor} />
        <ListButton editor={editor} />
        <ListOrderedButton editor={editor} />
        <AlignLeftButton editor={editor} />
        <AlignCenterButton editor={editor} />
        <AlignRightButton editor={editor} />
        <LineBreakButton editor={editor} />
        <HorizontalLineButton editor={editor} />
      </div>
      <ScrollBar orientation="horizontal" className="hidden" />
    </ScrollArea>
  );
}
