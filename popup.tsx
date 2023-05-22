import { useEffect, useState } from "react"
import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import { Button } from "~components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/icons"
import Pins from "@/components/Pins"
import User from "@/components/User"

const baseUrl =
  process.env.NODE_ENV == "production" || process.env.NODE_ENV == "development"
    ? "https://maintainer.cc/api"
    : "http://locahost:3000/api"

import "~/contents/global.css"
import "~/contents/base.css"

export const config: PlasmoCSConfig = {
  matches: [
    "https://github.com/*",
    "https://maintainer.cc/*"
    // "http://localhost:3000/*"
  ]
}

interface TSession {
  email: string
  id: string
  image: string
  name: string
}

const queryClient = new QueryClient()

const IndexPopup = () => {
  const [csrfToken, setCsrfToken] = useState("")
  const [session, setSession] = useState<TSession | null>(null)
  const [user, setUser] = useStorage("user")

  useEffect(() => {
    const init = async () => {
      if (user) {
        console.log("user present", user)
        return
      }

      console.log("user not present", user)

      fetch(`${baseUrl}/auth/csrf`).then(async (res) => {
        const json = await res.json()
        const csrf = json.csrfToken

        setCsrfToken(csrf)
      })

      fetch(`${baseUrl}/auth/session`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      }).then(async (res) => {
        const json = await res.json()
        if (json.user) {
          const { user } = json
          console.log("setting user", user)
          setUser(user)
        }
      })
    }

    init()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-[380px] rounded-lg">
        {user && user?.name && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Welcome 👋</CardTitle>
              <CardDescription>
                You have 3 unread messages.
                <Pins />
                <User />
                {/* <Avatar>
                  <AvatarImage src={user?.image} />
                  <AvatarFallback>{user?.name.slice(0, 2)}</AvatarFallback>
                </Avatar> */}
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">
              <div>
                <p>{user?.name}</p>
              </div>

              <form
                action={`${baseUrl}/auth/signout`}
                target="_blank"
                method="POST">
                <input
                  id="csrfToken-github"
                  type="hidden"
                  name="csrfToken"
                  value={csrfToken}
                />
                <Button type="submit" className="w-full">
                  <Icons.gitHub className="m-r h-4 w-4" />
                  Sign out
                </Button>
              </form>
            </CardContent>

            <CardFooter></CardFooter>
          </Card>
        )}
      </div>
    </QueryClientProvider>
  )
}

export default IndexPopup
