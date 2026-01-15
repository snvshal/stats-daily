"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SetState } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InitializeSD({ userId }: { userId: string }) {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const init = async () => {
    const rid = await handleInit(userId, setLoading);
    if (rid) router.push(`/areas/${rid}`);

    router.refresh();
  };

  const images = [
    "/area1.png",
    "/area2.png",
    "/area3.png",
    "/area4.png",
    "/area5.png",
  ];

  return (
    <ScrollArea className="flex-start box-border size-full flex-col overflow-x-hidden border-r">
      <header className="flex-between h-18 sticky top-0 z-20 w-full border-b bg-background p-4 max-md:pl-20">
        <p className="text-xl opacity-80 max-md:text-lg">
          Initialize StatsDaily
        </p>
        <Button
          type="submit"
          onClick={init}
          aria-label="Initialize StatsDaily"
          disabled={loading}
        >
          {loading ? "Initializing..." : "Initialize"}
        </Button>
      </header>
      <main className="flex w-full flex-col gap-4 p-4">
        {images.map((image, index) => (
          <div
            key={index}
            className={"div-bg-image"}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
      </main>
    </ScrollArea>
  );
}

export const handleInit = async (
  userId: string,
  setLoading: SetState<boolean>,
) => {
  setLoading(true);

  try {
    const response = await fetch("/api/stats/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const { rid, success, error } = await response.json();

    if (success) {
      return rid;
    } else {
      console.error("Initialization failed:", error || "Unknown error");
    }
  } catch (error) {
    console.error("Error:", (error as Error).message);
  }
};
