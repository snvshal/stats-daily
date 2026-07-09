import { TArea, TUser } from "@/lib/types";
import { currentUser, fetchAreaById } from "@/lib/db/stats";
import TaskList from "../task-list";
import AreaHeader from "./area-header";
import { ps } from "@/lib/utils";

export default async function ShowTasks({ areaId }: { areaId: string }) {
  const searchedData: TArea | undefined = await fetchAreaById(areaId);

  if (searchedData) {
    const serializableData: TArea = ps(searchedData);
    const { _id: areaId, area } = serializableData;

    const user: TUser = await currentUser();

    return (
      <div className="main-content flex flex-col gap-4 overflow-auto p-4 pt-0 max-sm:p-0">
        <div className="max-sm:px-4">
          <AreaHeader
            areaId={areaId?.toString() ?? ""}
            area={area}
            user={ps(user)}
          />
        </div>
        <TaskList data={serializableData} />
      </div>
    );
  } else {
    return (
      <div className="main-content flex-center">
        <h2>404 | Page Not Found</h2>
      </div>
    );
  }
}
