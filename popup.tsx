import type { PlasmoCSConfig } from "plasmo"
import { AuthProvider, useAuth } from "@/contexts/user"
import { UserActivityProvider, useUserActivity } from "@/contexts/activity"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

import UserPlan from "~components/UserPlan"

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

  const handleLinkClick = (url: string) => {
    // e.preventDefault()
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.update(tabs[0].id, { url: url })
    })
  }

  return (
    <>
      {user && user?.isAuthed ? (
        <div className="flex max-h-full flex-col space-y-1.5 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">dossi</h1>
            <UserAccountNav user={user} />
          </div>

          <div className="grid gap-4">
            <div>
              {status === "success" &&
                activity &&
                activity.map((notification, index) => (
                  <div
                    key={index}
                    className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    {/* {JSON.stringify(notification.entity.url)} */}

                    <div className="space-y-1">
                      <span className="flex h-2 w-2 translate-y-1 rounded-full bg-accent"></span>
                      <p
                        className="text-sm font-medium leading-none"
                        onClick={() =>
                          handleLinkClick(notification?.entity?.url)
                        }>
                        {notification?.entity?.title} here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(
                          new Date(notification?.createdAt),
                          {
                            addSuffix: true,
                          }
                        )}
                      </p>
                    </div>
                  </div>
                ))}
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
          <Tabs defaultValue="account" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="pins">Pins</TabsTrigger>
              <TabsTrigger value="later">Later</TabsTrigger>
            </TabsList>
            <TabsContent value="recent">
              Make changes to your account here.
            </TabsContent>
            <TabsContent value="pins">Change your password here.</TabsContent>
            <TabsContent value="later">for later.</TabsContent>
          </Tabs>
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
