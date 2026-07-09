import { Loader } from "lucide-react";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="main-content flex-center">
      <Loader className="animate-spin" />
    </div>
  );
}
