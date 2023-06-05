import { useEffect, useState } from "react"
import type { PlasmoCSConfig } from "plasmo"

import { useStorage } from "@plasmohq/storage/hook"

import { sendToBackground } from "@plasmohq/messaging"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { Button } from "~components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Icons } from "@/components/icons"
import Pins from "~components/PinButton"
// import User from "@/components/User"

const baseUrl =
  process.env.NODE_ENV == "production" || process.env.NODE_ENV == "development"
    ? process.env.PLASMO_PUBLIC_HOST_API
    : "http://locahost:3000/api"

import "~/contents/global.css"
import "~/contents/base.css"

const matches = process.env.PLASMO_PUBLIC_MATCHES.split(",")

export const config: PlasmoCSConfig = {
  matches
}

const queryClient = new QueryClient()

const IndexPopup = () => {
  const [authedUser, setAuthedUser] = useStorage("user")

  useEffect(() => {
    const init = async () => {
      const { user, status } = await sendToBackground({
        name: "user" as never
      })

      setAuthedUser(user?.user)
    }

    init()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-[380px] rounded-lg">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back
              </h1>
            </CardTitle>
            <CardDescription>{/* <User /> */}</CardDescription>
          </CardHeader>

          {authedUser && authedUser?.isAuthed ? (
            <CardContent className="grid gap-4">
              <>
                <div>
                  <p>{authedUser?.name}</p>
                </div>
                {/* <Pins /> */}

                <form
                  action={`${baseUrl}/auth/signout`}
                  target="_blank"
                  method="POST">
                  <Button type="submit" className="w-full">
                    Sign out
                  </Button>
                </form>
              </>
            </CardContent>
          ) : (
            <CardContent className="grid gap-4">
              <p className="text-sm text-muted-foreground">
                Sign in to your account
              </p>

              <Button asChild>
                <a href={`${baseUrl}/auth/signin`} target="_blank">
                  <Icons.logo className="mr-4 h-4 w-4" />
                  Sign in to dossi
                </a>
              </Button>
            </CardContent>
          )}
          <CardFooter></CardFooter>
        </Card>
      </div>
    </QueryClientProvider>
  )
}

export default IndexPopup
