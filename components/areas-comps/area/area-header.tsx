"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteArea } from "@/lib/services/handle-delete";
import { useAppDispatch } from "@/store/hooks";
import { removeAreaById, setCurrentArea } from "@/features/area-slice";
import IconButton from "@/components/ui/icon-button";
import Input from "@/components/ui/input";
import { updateAreaName } from "@/lib/services/handle-update";
import { ConfirmDeletionDialog } from "@/components/confirm-dialog";
import { InputChangeEvent, TaskItemCompoProps } from "@/lib/types";
import { ModeToggle } from "@/components/theme-provider";
import { handleKeyDownEnter } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserButton } from "@clerk/nextjs";
import { CircleAlert, Pencil, Trash, ChevronDown } from "lucide-react";
import { RenameAreaDialog } from "@/components/confirm-dialog";

export default function AreaHeader(props: { areaId: string; area: string }) {
  const { areaId, area } = props;

  const areaRef = useRef<HTMLInputElement>(null);

  const [inputError, setInputError] = useState("");
  const [areaName, setAreaName] = useState(area);
  const [prevAreaInput, setPrevAreaInput] = useState("");
  const [updating, setUpdating] = useState(false);
  const [areaInput, setAreaInput] = useState(areaName);
  const [dialog, openDialog] = useState(false);

  const tAreaInput = areaInput.trim();

  const dispatch = useAppDispatch();

  const handleAreaChange = (event: InputChangeEvent) => {
    setAreaInput(event.target.value);
    setInputError("");
  };

  const openRenameAreaDialog = () => {
    openDialog(true);
    setAreaInput(areaName);
    setInputError("");
  };

  const handleAreaUpdate = async () => {
    // Validate input area name
    if (!validateAreaName()) return;

    setUpdating(true);

    const response = await updateAreaName(areaId, areaInput);

    if (response && response.duplicate) {
      setPrevAreaInput(tAreaInput);
      setInputError(`'${tAreaInput}' already exists!`);
    } else {
      setInputError("");
      setAreaName(areaInput);
      dispatch(setCurrentArea({ areaId, area: tAreaInput }));
      openDialog(false);
    }

    setUpdating(false);
  };

  const validateAreaName = () => {
    if (inputError) return false;

    if (!tAreaInput) {
      setAreaInput("");
      setInputError("Area cannot be empty!");
      return false;
    }

    if (tAreaInput.length > 20) {
      setInputError("Only 20 characters allowed!");
      return false;
    }

    if (prevAreaInput === tAreaInput) {
      setInputError(`'${tAreaInput}' already exists!`);
      return false;
    }

    return true;
  };

  return (
    <div className="w-full">
      <div className="flex-between relative w-full gap-4 overflow-x-hidden px-1 py-4 max-md:pl-16">
        <div className="flex-start max-w-[80%] max-sm:max-w-[50%]">
          <TaskItemCompo
            areaId={areaId}
            areaName={areaName}
            openRenameAreaDialog={openRenameAreaDialog}
          />
        </div>

        <div className="z-20 flex gap-4">
          <ModeToggle />
          <IconButton className="h-10 w-10">
            <UserButton />
          </IconButton>
        </div>
      </div>

      <RenameAreaDialog
        dialog={dialog}
        updating={updating}
        onClick={handleAreaUpdate}
        openDialog={openDialog}
      >
        <div className="flex w-full flex-col items-end justify-center gap-2">
          <Input
            label="Area"
            ref={areaRef}
            name="area"
            value={areaInput}
            onChange={handleAreaChange}
            className="h-10 w-3/4"
            labelClasses="w-full flex-end gap-4"
            onKeyDown={(e) => handleKeyDownEnter(e, handleAreaUpdate)}
          />
          {inputError && (
            <span className="flex-start gap-1 text-sm text-[#f93a37] opacity-80">
              <CircleAlert size={15} />
              <span>{inputError}</span>
            </span>
          )}
        </div>
      </RenameAreaDialog>
    </div>
  );
}

export function TaskItemCompo(props: TaskItemCompoProps) {
  const { areaId, areaName, openRenameAreaDialog } = props;
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [deleteDialog, setDeleteDialog] = useState(false);

  const handleDelete = async () => {
    await deleteArea(areaId);
    dispatch(removeAreaById(areaId));
    router.push("/areas/create");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex-center z-10 w-full gap-1 border-0 outline-0"
          >
            <h2 className="truncate text-xl opacity-80 max-md:text-lg">
              {areaName}
            </h2>
            <ChevronDown size={18} className="w-5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-20">
          <DropdownMenuItem onClick={openRenameAreaDialog}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Rename</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeleteDialog(true)}>
            <Trash className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirm Delete Dialog Component */}
      <ConfirmDeletionDialog
        deleteDialog={deleteDialog}
        setDeleteDialog={setDeleteDialog}
        onClick={handleDelete}
      />
    </>
  );
}
