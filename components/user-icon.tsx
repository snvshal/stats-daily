"use client";

import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Mail, UserRound } from "lucide-react";
import { TUser } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function UserProfile({ user }: { user: TUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar
          role="button"
          tabIndex={0}
          aria-label="View Profile"
          className="rounded-lg"
        >
          <AvatarImage src={user?.image} className="rounded-lg" />
          <AvatarFallback className="rounded-lg">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-lg">
        <DropdownMenuItem
          className="rounded-lg max-sm:p-2"
          aria-label="Username"
        >
          <UserRound className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>{user?.name}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-lg max-sm:p-2" aria-label="Email">
          <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>{user?.email}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="rounded-lg max-sm:p-2"
          aria-label="SignOut"
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
