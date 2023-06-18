import type { PlasmoCSConfig } from "plasmo"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider, useAuth } from "@/contexts/user"
import { Button } from "~components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"

import { baseApiUrl } from "~lib/constants"
import "~/contents/global.css"
import "~/contents/base.css"

const matches = process.env.PLASMO_PUBLIC_MATCHES.split(",")

export const config: PlasmoCSConfig = {
  matches
}

const queryClient = new QueryClient()

const Popup = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PopupPage />
      </AuthProvider>
    </QueryClientProvider>
  )
}

const PopupPage = () => {
  const user = useAuth()

  return (
    <div className="w-[380px] rounded-lg">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-semibold tracking-tight">dossi</h1>
          </CardTitle>
          <CardDescription>{/* <User /> */}</CardDescription>
        </CardHeader>

        {user && user?.isAuthed ? (
          <>
            <CardContent className="grid gap-4">
              <>
                <div>
                  <p>{user?.attrs?.name}</p>
                </div>

                <form
                  action={`${baseApiUrl}/auth/signout`}
                  target="_blank"
                  method="POST">
                  <Button type="submit" className="w-full">
                    Sign out
                  </Button>
                </form>
              </>
            </CardContent>
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
          </>
        ) : (
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
        )}
        <CardFooter></CardFooter>
      </Card>
    </div>
  )
}

export default Popup
