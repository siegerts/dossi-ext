import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { baseUrl, baseApiUrl } from "~lib/constants"

import { UserAvatar } from "@/components/user-avatar"
import { usePlanData } from "@/contexts/plan"
import { Icons } from "@/components/icons"

export function UserAccountNav({ user }) {
  const { plan } = usePlanData()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{
            name: user.attrs.name || null,
            image: user.attrs.image || null,
          }}
          className="h-8 w-8"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.attrs.name && (
              <p className="font-medium">{user.attrs.name}</p>
            )}
            {user.attrs.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.attrs.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            chrome.runtime.sendMessage({ action: "openOptionsPage" })
          }>
          <Icons.settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`${baseUrl}/dashboard`}
            target="_blank"
            className="!text-primary !no-underline">
            <Icons.cloud className="mr-2 h-4 w-4" />
            Go to dashboard
          </a>
        </DropdownMenuItem>
        {plan && plan !== "PRO" ? (
          <DropdownMenuItem asChild className="!text-primary !no-underline">
            <a href={`${baseUrl}/dashboard/billing`} target="_blank">
              <Icons.creditCard className="mr-2 h-4 w-4" />
              Upgrade to PRO
            </a>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild className="text-blue-500">
            <a href={`${baseUrl}/dashboard/billing`} target="_blank">
              <Icons.creditCard className="mr-2 h-4 w-4" />
              Subscribed to {plan} 🎉
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="cursor-pointer !text-primary !no-underline">
          <a href={`${baseApiUrl}/auth/signout`} target="_blank">
            <Icons.logout className="mr-2 h-4 w-4" />
            Sign out
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
