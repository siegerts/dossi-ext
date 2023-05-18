import { useEffect, useState } from "react"
import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { Button } from "~components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/icons"

const baseUrl =
  process.env.NODE_ENV == "production" || process.env.NODE_ENV == "development"
    ? "https://maintainer.cc/api"
    : "http://locahost:3000/api"

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
          setUser(user)
        }
      })
    }

    init()
  }, [])

  return (
    <>
      {user && user?.name && (
        <>
          <h2>Welcome 👋</h2>
          <Avatar>
            <AvatarImage src={user?.image} />
            <AvatarFallback>{user?.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <h2>{user?.id}</h2>
          <h2>{user?.name}</h2>
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
            <Button type="submit">
              <Icons.gitHub className="m-r h-4 w-4" />
              Sign out
            </Button>
          </form>
        </>
      )}

      {!user && (
        <form
          action={`${baseUrl}/auth/signin/github`}
          target="_blank"
          method="POST">
          <input
            id="csrfToken-github"
            type="hidden"
            name="csrfToken"
            value={csrfToken}
          />
          <Button type="submit">
            <Icons.gitHub className="m-r h-4 w-4" />
            Log in with GitHub
          </Button>
        </form>
      )}
    </>
  )
}

export default IndexPopup
