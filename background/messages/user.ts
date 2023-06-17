import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { baseApiUrl } from "~lib/constants"

const storage = new Storage()

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // console.log("get user request received")

  const cookie = await chrome.cookies.get({
    url: process.env.PLASMO_PUBLIC_HOST,
    name: "__Secure-next-auth.session-token"
  })

  const user = await storage.get("user")

  if (!cookie) {
    console.log("no cookie found")
    // await storage.remove("user")
    await storage.removeAll()
    return res.send({ status: { ok: false, error: "user not logged in" } })
  }

  if (cookie && !user) {
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
        await storage.set("user", {
          user: { isAuthed: true, attrs: json.user }
        })
        const user = await storage.get("user")

        return res.send({ status: { ok }, user })
      } else {
        // clear user
        await storage.remove("user")
        return res.send({ status: { ok, error: "user not logged in" } })
      }
    } else {
      await storage.remove("user")
      return res.send({ status: { ok, error: "user info not available" } })
    }
  } else {
    // console.log("skipping...user already logged in")
  }
}

export default handler
