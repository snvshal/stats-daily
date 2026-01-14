import { LoaderIcon } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-center h-dvh">
      <LoaderIcon className="animate-spin" />
    </div>
  );
}
