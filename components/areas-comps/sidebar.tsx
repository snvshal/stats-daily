"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { TSC, SetState, SidebarContentProps } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { insertAllAreas } from "@/features/area-slice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  BarChart2Icon,
  BlocksIcon,
  CalendarIcon,
  KeyIcon,
  MenuIcon,
  NotebookIcon,
  SquarePenIcon,
  TrophyIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { TooltipComponent } from "../ui/tooltip";
import { ScrollArea } from "../ui/scroll-area";
import useKeyShortcut from "@/hooks/key-shortcut";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SDIcon } from "../home-page";

export default function Sidebar({
  data,
  children,
}: {
  data: TSC[];
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const areas = useAppSelector((state) => state.area.areas);

  const [isSidebarOpen, setSidebarState] = useState(false);

  useEffect(() => {
    dispatch(insertAllAreas(data));
  }, [data, dispatch]);

  const toggleSidebar = () => setSidebarState((prev) => !prev);

  return (
    <div className="mx-auto flex h-screen w-full max-w-7xl">
      <Sheet open={isSidebarOpen} onOpenChange={setSidebarState}>
        <SheetTrigger
          className={`flex-center bbn fixed left-4 top-4 z-50 h-10 w-10 rounded-lg bg-background hover:bg-accent hover:text-accent-foreground max-md:flex md:hidden ${isSidebarOpen && "hidden"}`}
          onClick={toggleSidebar}
          aria-labelledby="open-sidebar-btn"
        >
          <MenuIcon size={20} />
          <span id="open-sidebar-btn" className="hidden">
            Open Sidebar
          </span>
        </SheetTrigger>
        <SheetContent side="left" className="w-4/5 min-w-64 p-2 md:hidden">
          <SheetHeader>
            <SheetTitle className="my-8">
              <CreateAreaLink
                setSidebarState={setSidebarState}
                isArea={data?.length > 0}
              />
            </SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          <SidebarContent areas={areas} setSidebarState={setSidebarState} />
        </SheetContent>
      </Sheet>

      <div className="box-border h-full w-64 overflow-auto border-r px-2 max-md:hidden">
        <div className="my-4 box-border">
          <CreateAreaLink
            setSidebarState={setSidebarState}
            isArea={data?.length > 0}
          />
        </div>
        <SidebarContent areas={areas} />
      </div>
      <div className="w-full md:w-[calc(100%-16rem)]">{children}</div>
    </div>
  );
}

export function SidebarContent(props: SidebarContentProps) {
  const { areas, setSidebarState } = props;

  const { areaId } = useParams();
  const router = useRouter();

  const handleAreaNavigation = (areaId: string) => {
    if (setSidebarState) setSidebarState(false);
    router.push(`/areas/${areaId}`);
    router.refresh();
  };

  // Shortcut to create a new area
  useKeyShortcut({
    key: "a",
    modifiers: ["altKey"],
    action: () => (areaId === "create" ? null : router.push(`/areas/create`)),
  });

  return (
    <ScrollArea className="h-[calc(100%-10rem)] w-full overflow-x-hidden px-2">
      {areas?.map((item, index) => (
        <div
          key={index}
          className={`link-click-effect my-2 box-border w-[calc(100%-8px)] rounded-lg hover:bg-secondary ${item.areaId === areaId ? "bg-secondary" : "bg-background"}`}
        >
          <button
            onClick={() => handleAreaNavigation(item?.areaId as string)}
            className="flex-start box-border w-full gap-4"
          >
            <span className="flex-center bbn h-10 w-10 rounded-lg">
              {index + 1}
            </span>
            <p className="w-40 flex-1 truncate text-start">{item.areaName}</p>
          </button>
        </div>
      ))}
    </ScrollArea>
  );
}

export function CreateAreaLink({
  setSidebarState,
  isArea = false,
}: {
  setSidebarState: SetState<boolean>;
  isArea: boolean;
}) {
  const navLinks = [
    { href: "/stats", text: "Stats", icon: BarChart2Icon },
    { href: "/notes", text: "Notes", icon: NotebookIcon },
    { href: "/achievements/today", text: "Achievements", icon: TrophyIcon },
    { href: "/countdown", text: "Countdown", icon: CalendarIcon },
    { href: "/api-keys", text: "API Keys", icon: KeyIcon },
  ];
  return (
    <div className="flex flex-col gap-2">
      <Link
        className="flex-between link-click-effect mx-2 h-10 rounded-lg pr-4"
        onClick={() => setSidebarState(false)}
        href="/areas/create"
      >
        <span className="flex-start gap-4">
          <SDIcon />
          <p>StatsDaily</p>
        </span>
        <TooltipComponent content="Create Area">
          <SquarePenIcon
            size={20}
            aria-hidden="true"
            className="text-muted-foreground"
          />
        </TooltipComponent>
        <span className="sr-only">Create new area</span>
      </Link>
      {isArea && (
        <Popover>
          <PopoverTrigger className="flex-start mx-2 h-10 gap-4 rounded-lg pr-4">
            <span className="bbn flex-center size-10 rounded-lg p-0">
              <BlocksIcon size={20} />
            </span>
            <span>More</span>
          </PopoverTrigger>
          <PopoverContent className="left-8 space-y-2 shadow-lg">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="flex-start link-click-effect h-10 gap-4 rounded-lg"
              >
                <Button variant="ghost" className="bbn size-10 p-0">
                  <link.icon size={20} />
                </Button>
                <p>{link.text}</p>
              </Link>
            ))}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
