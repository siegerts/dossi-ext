import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const storage = new Storage()

const baseUrl =
  process.env.NODE_ENV == "production" || process.env.NODE_ENV == "development"
    ? process.env.PLASMO_PUBLIC_HOST_API
    : "http://locahost:3000/api"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("get user request received")
  const resp = await fetch(`${baseUrl}/auth/session`, {
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
      await storage.set("user", { user: { isAuthed: true, attrs: json.user } })
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
}

export default handler

// fetch(`${baseUrl}/auth/csrf`).then(async (res) => {
//     const json = await res.json()
//     const csrf = json.csrfToken

//     setCsrfToken(csrf)
//   })
