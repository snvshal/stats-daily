import { Document } from "mongoose";
import { ImageProps } from "next/image";
import React, { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

// Stats Schema Type
export type TStats = {
  userId: string;
  note?: string;
  taskStats: TaskStats[];
  updatedAt?: Date;
  createdAt?: Date;
} & Document;

export type TaskStats = {
  area: string;
  note?: string;
  total: number;
  completed: number;
  achieved: number;
};

// Stat Schema Type
export type TArea = {
  userId: string;
  area: string;
  note?: string;
  tasks: TTask[];
} & Document;

// Task Schema Type
export type TTask = {
  task: string;
  achieved: number;
  completed: boolean;
  updatedAt?: Date;
  createdAt?: Date;
} & Document;

// User Schema Type
export type TUser = {
  email: string;
  name: string;
  image: string;
} & Document;

// Note Schema Type
export type TNote = {
  userId: string;
  content: string;
  updatedAt?: Date;
  createdAt?: Date;
} & Document;

// Achievement Schema Type
export type TAchievementTask = {
  _id?: string;
  text: string;
};

export type TAchievement = {
  userId: string;
  achievements: TAchievementTask[];
  note?: string;
  updatedAt?: Date;
  createdAt?: Date;
} & Document;

// TSC Type
export type TSC = {
  areaId?: string;
  areaName?: string;
};

// Input Props Type
export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  labelClasses?: string;
  children?: React.ReactNode;
};

// TaskInput Props Type
export type TaskInputProps = InputProps & {
  className?: string;
  inputAttributes: InputProps[];
  submitBtn?: React.RefObject<HTMLButtonElement>;
};

// Generic React utilities for state, events, and type handling
export type OmitDocument<T> = Omit<T, keyof Document>;
export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type ChangeEvent<T> = React.ChangeEvent<T>;

// Form Slice InitialState Type
export type InitialState = {
  area: string;
  note: string;
  task: string;
  tasks: OmitDocument<TTask>[];
  etem: string;
};

// Apply OmitDocument to both TStat and TTask
export type StatsWithoutDocument = {
  userId: string;
  area: string;
  note?: string;
  tasks: OmitDocument<TTask>[];
};

// AreaRef Object Type
export type AreaRef = {
  _id: string;
  el: HTMLDivElement | null;
};

// Button Props Type
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  variant: string;
};

// IconButton Props Type
export type IconButtonProps = ButtonProps & ImageProps;

// API PATCH Route Type
export type RequestJsonData = {
  id: string;
  taskId: string;
  task: TTask;
  note: string;
  area: string;
};

// Dialog Props Type
export type CompletionDialogProps = {
  task: string;
  children: React.ReactNode;
  onClick: () => void;
  openDialog: boolean;
  setOpenDialog: SetState<boolean>;
};

// Confirm Dialog Props Type
export type ConfirmDialogProps = {
  deleting: boolean;
  deleteDialog: boolean;
  setDeleteDialog: SetState<boolean>;
  onClick: () => void;
};

// Add New Task Props Type
export type AddNewTaskProps = {
  areaId: string;
  addTaskInput: boolean;
  setAddTaskInput: SetState<boolean>;
};

// Task Item Props Type
export type TaskItemCompoProps = {
  areaId: string;
  areaName: string;
  openRenameAreaDialog: () => void;
};

// Rename Area Dialog Props Type
export type RenameAreaDialogProps = {
  onClick: () => void;
  dialog: boolean;
  updating: boolean;
  openDialog: SetState<boolean>;
  children: React.ReactNode;
};

// Task Status Props Type
export type TaskStatusPCProps = {
  areaId: string;
  index: number;
  openInputTask: boolean;
  taskItem: TTask;
  setShowTaskState: SetState<boolean>;
};

// Task List Items Props Type
export type TaskListItemsProps = {
  index: number;
  areaId: string;
  taskItem: TTask;
  oita: boolean;
  nfaf: (s: boolean, i: number) => void;
  areaName: string;
};

// Validation Alert Dialog Props Type
export type ValidationAlertDialogProps = {
  category: "note" | "task";
  alertDialog: boolean;
  setAlertDialog: SetState<boolean>;
};

// Task Options UI Props Type
export type TaskOptionsUIProps = {
  oita: boolean;
  index: number;
  handleEditTask: () => void;
  handleDeleteTask: () => void;
  handleEditClick: () => void;
  nfaf: (s: boolean, i: number) => void;
  showTaskState: boolean;
  loading: boolean;
};

//  Range Chart Component Props Type
export type RangeChartProps = {
  date: string;
  desktop: number;
  mobile: number;
};

// Stats Page Header Props Type
export type HeaderProps = {
  selectedValue: string;
  setSelectedValue: SetState<string>;
  children: React.ReactNode;
};

// Stats Page Main Content Props Type
export type MainContentProps = {
  stats: TStats[];
  selectedValue: string;
};

// Sidebar Content Props Type
export type SidebarContentProps = {
  areas: TSC[];
  setSidebarState?: SetState<boolean>;
};

// Area Header Props Type
export type AreaHeaderProps = {
  areaId: string;
  area: string;
  user: TUser;
};

// Daily Note Props Type
export type AreaNoteProps = {
  areaId: string;
  note: string;
};

// Show Task Dialog Props Type
export type ShowTaskDialogProps = {
  task: string;
  areaName: string;
  showTaskState: boolean;
  setShowTaskState: SetState<boolean>;
  markAsDone: React.ReactNode;
  taskOptions: React.ReactNode;
};
