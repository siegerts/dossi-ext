import { useState, useEffect } from "react"
import type { PlasmoCSConfig } from "plasmo"
import { AuthProvider, useAuth } from "@/contexts/user"
import { UserActivityProvider, useUserActivity } from "@/contexts/activity"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"
import { UserAccountNav } from "@/components/user-account-nav"
import { baseApiUrl } from "~lib/constants"
import UserPlan from "@/components/user-plan"

import "~/contents/base.css"
// import "~/contents/global.css"
import cssText from "data-text:~/contents/global.css"

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
        height: "600px",
        width: "350px",
      }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserActivityProvider>
            <PopupPage />
          </UserActivityProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  )
}

const PopupPage = () => {
  const user = useAuth()
  const { activity, status } = useUserActivity()
  const [activitySummaries, setActivitySummaries] =
    useState<ActionsByURLAndDate>({})

  const handleLinkClick = (url: string) => {
    // e.preventDefault()
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
    console.log(groupedActions)
  }, [activity])

  return (
    <>
      {user && user?.isAuthed ? (
        <div className="flex max-h-full flex-col space-y-1.5 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">dossi</h1>
            <div className="flex items-center gap-2">
              <UserPlan />
              <UserAccountNav user={user} />
            </div>
          </div>
          <Separator />

          <Tabs defaultValue="recent" className="grid w-full grid-cols-2">
            <TabsList className="">
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="pins">Pins</TabsTrigger>
            </TabsList>
            <TabsContent value="recent">recent tab</TabsContent>
            <TabsContent value="pins">pinned items</TabsContent>
            {/* <TabsContent value="later">for later.</TabsContent> */}
          </Tabs>

          <div className=" grid gap-4 text-sm">
            <div className="mt-3">
              {status === "success" &&
                activity &&
                Object.entries(activitySummaries).map(
                  ([key, actions], index) => (
                    <div
                      key={index}
                      className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                      <div className="space-y-1">
                        <p
                          className="text-sm font-medium leading-none"
                          onClick={() => handleLinkClick(key.split("_")[0])}>
                          Added {actions.length} notes on{" "}
                          {new URL(key.split("_")[0]).pathname.substring(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(key.split("_")[1]), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  )
                )}
              {status === "loading" && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <div className="my-5 flex items-center gap-3 space-x-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[320px]" />
                      <Skeleton className="h-4 w-[300px]" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[315px]" />
                      <Skeleton className="h-4 w-[310px]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Card className="height-max-full">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">dossi</h1>
              </div>
            </CardTitle>
            <CardDescription>{/* <User /> */}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              Sign in to your account
            </p>

            <Button asChild>
              <a href={`${baseApiUrl}/auth/signin`} target="_blank">
                <Icons.logo className="mr-4 h-4 w-4" />
                Sign in to dossi
              </a>
            </Button>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      )}
    </>
  )
}

export default Popup
