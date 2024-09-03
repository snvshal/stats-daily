import HomePage from "@/components/home-page";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();
  if (userId) {
    redirect("/areas/create");
  } else {
    return <HomePage />;
  }
}
