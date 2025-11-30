"use client";

import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  ShowTaskDialog,
  TaskCompletionDialog,
  ValidationAlertDialog,
} from "../dialogs";
import { Slider } from "../ui/slider";
import { updateStats, updateTask } from "@/lib/services/handle-update";
import IconButton from "../ui/icon-button";
import { deleteTask } from "@/lib/services/handle-delete";
import { Input } from "../ui/input";
import { handleKeyDownEnter, ntf } from "@/lib/utils";
import { Check, Pencil, Trash, X, Ellipsis, Loader2 } from "lucide-react";
import {
  TaskStatus,
  TaskContent,
  TaskOptions,
  InputRequiredAlert,
} from "./task-items";
import {
  InputChangeEvent,
  TaskListItemsProps,
  TaskOptionsUIProps,
  TaskStatusPCProps,
  TTask,
} from "@/lib/types";
import {
  setTaskCompletion,
  removeTaskById,
  setEditedTask,
  setIncompleteTasks,
} from "@/features/task-slice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipComponent } from "../ui/tooltip";
import { taskLength } from "@/lib/constants";
import { toast } from "sonner";
import store from "@/store/store";

export default function TaskListItem(props: TaskListItemsProps) {
  const { index, areaId, taskItem, oita, nfaf, areaName } = props;

  const task = taskItem.task;
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputTask, setInputTask] = useState(task);
  const [alertDialog, setAlertDialog] = useState(false);
  const [emptyInputAlert, setEmptyInputAlert] = useState(false);
  const [showTaskState, setShowTaskState] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  const deleteTimers = useRef(new Map<string, NodeJS.Timeout>());

  useEffect(() => {
    if (oita) inputRef.current?.focus();
  }, [oita]);

  const handleEditClick = () => {
    setEmptyInputAlert(false);
    nfaf(true, index);
    setInputTask(task);
    setShowTaskState(false);
  };

  const handleEditTask = async () => {
    if (!validateEditedTask()) return;

    setLoading(true);
    dispatch(setEditedTask({ index, task: inputTask }));
    nfaf(false, index);

    const taskObj = { ...taskItem, task: inputTask };

    await updateTask(areaId, taskObj as TTask);

    setLoading(false);
  };

  const validateEditedTask = () => {
    const editedTask = inputTask.trim();

    if (!editedTask) {
      setInputTask("");
      setEmptyInputAlert(true);
      return false;
    }

    if (editedTask.length > taskLength) {
      setAlertDialog(true);
      return false;
    }

    return true;
  };

  const handleEditInputChange = (event: InputChangeEvent) => {
    const { value } = event.target;
    setInputTask(value);
    setEmptyInputAlert(value ? false : true);
  };

  const handleDeleteTask = () => {
    dispatch(removeTaskById(taskItem._id));

    toast("Task deleted", {
      action: {
        label: "Undo",
        onClick: () => undoDelete(taskItem._id as string),
      },
      duration: 5000,
    });

    // create per-task timeout
    const timeout = setTimeout(async () => {
      await deleteTask(areaId, taskItem._id as string);
      deleteTimers.current.delete(taskItem._id as string);
    }, 5000);

    deleteTimers.current.set(taskItem._id as string, timeout);
  };

  const undoDelete = (taskId: string) => {
    const timer = deleteTimers.current.get(taskId);
    if (!timer) return;

    clearTimeout(timer);
    deleteTimers.current.delete(taskId);

    // find the backup in removedTasks
    const removed = store
      .getState()
      .task.removedTasks.find((t) => t.task._id === taskId);
    if (!removed) return;

    const { task, index } = removed;

    const current = store.getState().task.incompleteTasks;
    const updated = [...current];
    updated.splice(index, 0, task);

    dispatch(setIncompleteTasks(updated));
    toast.success("Task restored");
  };

  const handleOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const target = event.relatedTarget as HTMLElement;
    const nte = ["edit-button", "cancel-button", "okay-button"];

    if (!target || !nte.includes(target.id)) nfaf(false, index);
  };

  return (
    <>
      <ValidationAlertDialog
        category="task"
        alertDialog={alertDialog}
        setAlertDialog={setAlertDialog}
      />

      <div className="flex-between w-full">
        <TaskStatus>
          <TaskStatusPC
            index={index}
            areaId={areaId}
            openInputTask={oita}
            taskItem={taskItem}
            setShowTaskState={setShowTaskState}
          />
        </TaskStatus>

        <TaskContent>
          {oita ? (
            <>
              <Input
                ref={inputRef}
                type="text"
                name="task"
                className="rounded-none border-0 pl-0 outline-none"
                labelClasses="w-5/6"
                value={inputTask}
                onChange={handleEditInputChange}
                onKeyDown={(e) => handleKeyDownEnter(e, handleEditTask)}
                onBlur={(e) => handleOnBlur(e)}
                disabled={loading}
                aria-label="Edit task"
                aria-invalid={emptyInputAlert}
                aria-required="true"
              />
              {emptyInputAlert && <InputRequiredAlert />}
            </>
          ) : (
            <ShowTaskDialog
              task={task}
              areaName={areaName}
              showTaskState={showTaskState}
              setShowTaskState={setShowTaskState}
              markAsDone={
                <TaskStatusPC
                  index={index}
                  areaId={areaId}
                  openInputTask={oita}
                  taskItem={taskItem}
                  setShowTaskState={setShowTaskState}
                />
              }
              taskOptions={
                <TaskOptionsUI
                  oita={oita}
                  index={index}
                  nfaf={nfaf}
                  handleEditTask={handleEditTask}
                  handleDeleteTask={handleDeleteTask}
                  handleEditClick={handleEditClick}
                  showTaskState={showTaskState}
                  loading={loading}
                />
              }
            />
          )}
        </TaskContent>

        <TaskOptions>
          <TaskOptionsUI
            oita={oita}
            index={index}
            nfaf={nfaf}
            handleEditTask={handleEditTask}
            handleDeleteTask={handleDeleteTask}
            handleEditClick={handleEditClick}
            showTaskState={showTaskState}
            loading={loading}
          />
        </TaskOptions>
      </div>
    </>
  );
}

export function TaskStatusPC(props: TaskStatusPCProps) {
  const { areaId, index, openInputTask, taskItem, setShowTaskState } = props;

  const [openDialog, setOpenDialog] = useState(false);
  const dispatch = useAppDispatch();

  // Ensure the state is typed as number[]
  const [value, setValue] = useState<number[]>([50]);

  const handleSaveTask = async () => {
    const taskObj = ntf(taskItem, true, value[0]);

    dispatch(setTaskCompletion({ index, achieved: value[0] }));

    setOpenDialog(false);
    setShowTaskState(false);
    await updateTask(areaId, taskObj as TTask);
    await updateStats(areaId, value[0]);
  };

  if (openInputTask) {
    return <span className="status-button border-blue-400 bg-blue-400"></span>;
  } else {
    return (
      <TaskCompletionDialog
        onClick={handleSaveTask}
        task={taskItem.task}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
      >
        <div className="flex-between w-full">
          <Slider
            className="w-4/5"
            min={1}
            max={100}
            step={1}
            value={value}
            onValueChange={(newValue) => setValue(newValue)}
            onKeyDown={(e) => handleKeyDownEnter(e, handleSaveTask)}
          />
          <span>{value}%</span>
        </div>
      </TaskCompletionDialog>
    );
  }
}

export function TaskOptionsUI({
  oita,
  index,
  nfaf,
  handleEditTask,
  handleDeleteTask,
  handleEditClick,
  showTaskState,
  loading,
}: TaskOptionsUIProps) {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // Function to update state with the current window width
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (oita) {
    if (loading) {
      return (
        <div className="flex-center mr-2 size-8 max-sm:w-full">
          <Loader2 className="animate-spin" aria-hidden="true" />
          <span role="status" aria-live="assertive" className="sr-only">
            Saving updated Task
          </span>
        </div>
      );
    } else {
      return (
        <>
          <IconButton
            id="edit-button"
            className="max-sm:mr-2"
            onClick={handleEditTask}
            aria-label="Save Edited Task"
          >
            <Check size={15} />
          </IconButton>
          <IconButton
            className="max-sm:hidden"
            onClick={() => nfaf(false, index)}
            aria-label="Close Editing Task"
          >
            <X size={15} />
          </IconButton>
        </>
      );
    }
  } else {
    if (windowWidth < 640 && !showTaskState) {
      return (
        <span className="flex-end w-full pr-2">
          <DropdownMenu>
            <TooltipComponent content="Task Options">
              <DropdownMenuTrigger asChild>
                <IconButton variant="ghost" aria-label="Task Options">
                  <Ellipsis size={15} />
                </IconButton>
              </DropdownMenuTrigger>
            </TooltipComponent>
            <DropdownMenuContent className="w-24">
              <DropdownMenuItem onClick={handleEditClick} className="p-2">
                <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteTask} className="p-2">
                <Trash
                  className="mr-2 h-4 w-4 text-red-500"
                  aria-hidden="true"
                />
                <span className="text-red-500">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      );
    } else {
      return (
        <>
          <IconButton onClick={handleEditClick} aria-label="Edit Task">
            <Pencil size={15} />
          </IconButton>
          <IconButton onClick={handleDeleteTask} aria-label="Delete Task">
            <Trash size={15} />
          </IconButton>
        </>
      );
    }
  }
}
