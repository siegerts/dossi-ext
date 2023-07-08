import { useState, useEffect } from "react"
import type { PlasmoCSConfig } from "plasmo"
import { AuthProvider, useAuth } from "@/contexts/user"
import { UserActivityProvider, useUserActivity } from "@/contexts/activity"
import { UserPinsProvider, useUserPins } from "@/contexts/pins"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"
import { UserAccountNav } from "@/components/user-account-nav"
import { baseUrl, baseApiUrl } from "~lib/constants"
import UserPlan from "@/components/user-plan"
import UserRole from "@/components/user-role"

import "~/contents/base.css"
// import "~/contents/global.css"
import cssText from "data-text:~/styles/globals.css"

// Inject into the ShadowDOM
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const matches = process.env.PLASMO_PUBLIC_MATCHES.split(",")

export const config: PlasmoCSConfig = {
  matches,
}

const queryClient = new QueryClient()

type Action = {
  id: string
  createdAt: string
  entity: {
    url: string
    title: string | null
  }
}

type ActionsByURLAndDate = { [key: string]: Action[] }

const Popup = () => {
  return (
    <div
      style={{
        width: "350px",
      }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserActivityProvider>
            <UserPinsProvider>
              <PopupPage />
            </UserPinsProvider>
          </UserActivityProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  )
}

const PopupPage = () => {
  const user = useAuth()
  const { activity, status } = useUserActivity()
  const { pins, status: pinsStatus } = useUserPins()
  const [activitySummaries, setActivitySummaries] =
    useState<ActionsByURLAndDate>({})

  const handleLinkClick = (url: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.update(tabs[0].id, { url: url })
    })
  }

  useEffect(() => {
    if (!activity) return

    const groupedActions = activity.reduce((groups, action) => {
      const date = new Date(action.createdAt).toISOString().split("T")[0]

      const key = `${action.entity.url}_${date}`

      if (!groups[key]) {
        groups[key] = []
      }

      groups[key].push(action)
      return groups
    }, {})
    setActivitySummaries(groupedActions)
    // console.log("groupedActions", groupedActions)
  }, [activity])

  return (
    <>
      {user && user?.isAuthed ? (
        <div
          className="flex max-h-full flex-col space-y-1.5 p-6"
          style={{ height: "600px", width: "350px" }}>
          <UserRole />
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">dossi</h1>
            <div className="flex items-center gap-2">
              <UserPlan />
              <UserAccountNav user={user} />
            </div>
          </div>
          <Separator />

          <Tabs defaultValue="recent" className="w-[300]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="pins">Pins</TabsTrigger>
            </TabsList>
            <TabsContent value="recent">
              <div className="grid gap-4 text-sm">
                <div className="mt-4">
                  <ScrollArea className="h-[410px]">
                    {status === "success" && activity && activity.length > 0 ? (
                      Object.entries(activitySummaries).map(
                        ([key, actions], index) => (
                          <div
                            key={index}
                            className="mb-3 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                            <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                            <div className="space-y-1">
                              <p
                                className="cursor-pointer text-sm leading-none"
                                onClick={() =>
                                  handleLinkClick(key.split("_")[0])
                                }>
                                Added {actions.length} note
                                {actions.length > 1 ? "s" : null} on{" "}
                                {new URL(key.split("_")[0]).pathname.substring(
                                  1
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(key.split("_")[1]),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <div className="mt-4 flex flex-wrap items-center gap-2 pl-2">
                        <span>
                          No recent activity. <br />
                        </span>
                      </div>
                    )}
                  </ScrollArea>

                  {status === "loading" && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <div className="my-5 flex items-center gap-3 space-x-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[220px]" />
                          <Skeleton className="h-4 w-[100px]" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[241px]" />
                          <Skeleton className="h-4 w-[110px]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="pins">
              <div className="mt-4 ">
                {pinsStatus === "success" && pins && pins.length > 0 ? (
                  <ScrollArea className="h-[410px] ">
                    {pins.map((pin, index) => (
                      <div
                        key={index}
                        className="mb-3 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0">
                        <span className="flex h-2 w-2 translate-y-1 rounded-full bg-amber-500" />
                        <div
                          className="cursor-pointer space-y-1"
                          onClick={() => handleLinkClick(pin.url)}>
                          <div className="pl-0 text-left text-sm leading-none">
                            {new URL(pin.url).pathname
                              .split("/")
                              .slice(2)
                              .join("/")}
                          </div>
                          {pin.entity?.title && (
                            <p className="text-left text-xs text-muted-foreground">
                              {pin.entity.title}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                ) : (
                  <div className="mt-4 flex flex-wrap items-center gap-2 pl-2">
                    <span>
                      No pinned items yet. <br />
                    </span>
                  </div>
                )}
                {pinsStatus === "loading" && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <div className="my-5 flex items-center gap-3 space-x-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[220px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[241px]" />
                        <Skeleton className="h-4 w-[110px]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            {/* <TabsContent value="later">for later.</TabsContent> */}
          </Tabs>
        </div>
      ) : (
        <div style={{ width: "350px", height: "200px" }}>
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 p-4 sm:w-[225px]">
            <div className="flex flex-col space-y-2 text-center">
              <Icons.logo className="mx-auto h-6 w-6" />

              <p className="text-sm text-muted-foreground">
                Sign in to your account
              </p>
            </div>
            <div className="grid gap-6">
              <Button asChild variant="outline">
                <a href={`${baseApiUrl}/auth/signin`} target="_blank">
                  <Icons.logo className="mr-4 h-4 w-4" />
                  Sign in to dossi
                </a>
              </Button>
            </div>
            <p className="px-8 text-center text-sm text-muted-foreground">
              <a
                href={`${baseUrl}/register`}
                target="_blank"
                className="hover:text-brand underline underline-offset-4">
                Don&apos;t have an account? Sign Up
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default Popup
