import AreaHeader from "@/components/areas-comps/area/area-header";
import AreaNote from "@/components/areas-comps/area/area-note";
import { currentUser, fetchAreaById } from "@/lib/db/stats";
import { TArea } from "@/lib/types";
import { ps } from "@/lib/utils";
import { Metadata } from "next";

export const generateMetadata = async ({
  params,
}: {
  params: { areaId: string };
}): Promise<Metadata> => {
  const { areaId } = params;

  const areaItem = await fetchAreaById(areaId);
  return { title: `Note (${areaItem?.area})` };
};

export default async function AreaNotePage({
  params,
}: {
  params: { areaId: string };
}) {
  const { areaId } = params;
  const areaItem = await fetchAreaById(areaId);
  const { area, note } = areaItem as TArea;
  const user = await currentUser();
  return (
    <div className="size-full overflow-hidden p-4 pt-0">
      <AreaHeader areaId={areaId} area={area as string} user={ps(user)} />
      <div className="bbn mt-4 h-[calc(100vh-7rem)] rounded-lg p-4">
        <AreaNote areaId={areaId as string} note={note as string} />
      </div>
    </div>
  );
}
