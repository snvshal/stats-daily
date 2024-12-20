import React, { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

export function TaskStatus({ children }: { children: ReactNode }) {
  return <span className="flex-center w-12">{children}</span>;
}

export function TaskContent({ children }: { children: ReactNode }) {
  return (
    <span className="flex-start relative h-auto w-[calc(100%-8rem)] max-sm:w-[calc(100%-5.5rem)]">
      {children}
    </span>
  );
}

export function TaskOptions({ children }: { children: ReactNode }) {
  return <span className="flex-end w-20 gap-2 max-sm:w-10">{children}</span>;
}

export function InputRequiredAlert() {
  return (
    <span role="alert" aria-live="assertive" className="empty-alert">
      <CircleAlert size={15} aria-hidden="true" />
      <span>Task cannot be empty!</span>
    </span>
  );
}
