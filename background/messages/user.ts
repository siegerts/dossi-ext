import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { baseApiUrl } from "~lib/constants"

const storage = new Storage()

type User = {
  isAuthed: boolean
  attrs: {
    name: string
    email: string
    image: string
    id: string
    plan?: string
  }
}
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("get user request received")

  const cookie = await chrome.cookies.get({
    url: process.env.PLASMO_PUBLIC_HOST,
    name: "__Secure-next-auth.session-token"
  })

  const user = await storage.get<User>("user")

  if (!cookie) {
    // console.log("no cookie found, clearing all cached data")

    await storage.remove("user")
    await storage.remove("labels")

    return res.send({
      user: { isAuthed: false },
      status: { ok: false, error: "user not logged in" }
    })
  }

  if (cookie && !user?.isAuthed) {
    const resp = await fetch(`${baseApiUrl}/auth/session`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    })

    const ok = resp.ok

    if (resp.ok) {
      const json = await resp.json()
      if (json.user) {
        // save and return user
        const user = { isAuthed: true, attrs: json.user }

        await storage.set("user", user)

        return res.send({
          status: { ok },
          user
        })
      } else {
        // clear user & cache
        await storage.remove("user")
        await storage.remove("labels")

        return res.send({
          user: { isAuthed: false },
          status: { ok, error: "user not logged in" }
        })
      }
    } else {
      // clear user & cache
      await storage.remove("user")
      await storage.remove("labels")

      return res.send({
        user: { isAuthed: false },
        status: { ok, error: "user info not available" }
      })
    }
  } else {
    // console.log("user already logged in: returning cached user")

    return res.send({
      status: { ok: true },
      user
    })
  }
}

export default handler
