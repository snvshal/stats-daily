"use client";

import { useEffect, useRef, useState } from "react";
import { updateNote } from "@/lib/services/handle-update";
import { X, Check, Pencil } from "lucide-react";
import IconButton from "@/components/ui/icon-button";
import { ValidationAlertDialog } from "@/components/dialogs";
import { AreaNoteProps } from "@/lib/types";
import { areaNoteLength } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AreaNote({ areaId, note }: AreaNoteProps) {
  const tRef = useRef<HTMLTextAreaElement>(null);

  const [inputNote, setInputNote] = useState(false);
  const [noteState, setNoteState] = useState(note);
  const [noteInput, setNoteInput] = useState(noteState);
  const [alertDialog, setAlertDialog] = useState(false);

  useEffect(() => {
    const textarea = tRef.current;
    if (inputNote && textarea) {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, [inputNote]);

  useEffect(() => {
    const textarea = tRef.current;

    const adjustHeight = () => {
      const resize =
        window.innerWidth < 640 ||
        (window.innerWidth > 768 && window.innerWidth < 1024);

      if (resize && textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight + 2}px`;
      }
    };

    adjustHeight();
    window.addEventListener("resize", adjustHeight);
    return () => window.removeEventListener("resize", adjustHeight);
  }, [inputNote]);

  const handleNoteChange = async () => {
    if (noteInput?.trim().length > areaNoteLength) {
      setAlertDialog(true);
      return;
    }

    setInputNote(false);
    setNoteState(noteInput);

    await updateNote(areaId, noteInput);
  };

  const handleInputNoteClose = () => {
    setInputNote(false);
    setNoteInput(noteState);
  };

  return (
    <>
      <div className="flex-between mb-2 h-8 w-full">
        <p className="font-bold">Note</p>
        {inputNote ? (
          <span className="flex gap-2">
            <IconButton
              onClick={handleNoteChange}
              aria-label="Save Edited Note"
            >
              <Check size={15} />
            </IconButton>
            <IconButton
              onClick={handleInputNoteClose}
              aria-label="Close Editing Note"
            >
              <X size={15} />
            </IconButton>
          </span>
        ) : (
          <IconButton
            onClick={() => setInputNote(true)}
            aria-label="Edit note of the area"
          >
            <Pencil size={15} />
          </IconButton>
        )}
      </div>
      {inputNote ? (
        <textarea
          ref={tRef}
          name="note"
          value={noteInput}
          className="bbn w-full rounded-md bg-transparent p-1 max-md:h-[calc(100%-40px)] max-md:resize-none max-sm:max-h-72 max-sm:resize-y lg:h-[calc(100%-40px)] lg:resize-none"
          onChange={(e) => setNoteInput(e.target.value)}
          rows={10}
          role="textbox"
          aria-label="Edit Note Textarea"
        />
      ) : (
        <ScrollArea className="h-[calc(100%-40px)] w-full overflow-auto overflow-x-hidden text-ellipsis">
          <p className="whitespace-pre-wrap">
            {noteState || <span className="italic opacity-50">empty</span>}
          </p>
        </ScrollArea>
      )}

      <ValidationAlertDialog
        category="note"
        alertDialog={alertDialog}
        setAlertDialog={setAlertDialog}
      />
    </>
  );
}
