import type { PlasmoMessaging } from "@plasmohq/messaging"

const baseUrl =
  process.env.NODE_ENV == "production" || process.env.NODE_ENV == "development"
    ? process.env.PLASMO_PUBLIC_HOST_API
    : "http://locahost:3000/api"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
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
      return res.send({ status: { ok }, user: json.user })
    } else {
      return res.send({ status: { ok, error: "user not logged in" } })
    }
  } else {
    return res.send({ status: { ok, error: "user info not available" } })
  }
}

export default handler

// fetch(`${baseUrl}/auth/csrf`).then(async (res) => {
//     const json = await res.json()
//     const csrf = json.csrfToken

//     setCsrfToken(csrf)
//   })
