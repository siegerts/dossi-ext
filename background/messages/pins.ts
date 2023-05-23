import type { PlasmoMessaging } from "@plasmohq/messaging"

const baseUrl =
  process.env.NODE_ENV == "production" || process.env.NODE_ENV == "development"
    ? "https://maintainer.cc/api"
    : "http://locahost:3000/api"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  switch (req?.body?.type) {
    case "GET": {
      const resp = await fetch(`${baseUrl}/pins`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      })

      const ok = resp.ok

      if (resp.ok) {
        const pins = await resp.json()
        return res.send({ pins, status: { ok } })
      } else {
        if (resp.status === 403) {
          return res.send({ status: { ok, error: "user not logged in" } })
        } else {
          console.log("error ")
          return res.send({ status: { ok, error: "pins not available" } })
        }
      }
    }

    case "POST": {
      console.log("URL sender", req.sender)
      const resp = await fetch(`${baseUrl}/pins`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: req.sender.tab.url
        })
      })

      const ok = resp.ok

      if (resp.ok) {
        const pin = await resp.json()
        return res.send({
          pin
        })
      } else {
        if (resp.status === 403) {
          return res.send({ status: { ok, error: "user not logged in" } })
        } else {
          console.log("error ")
          return res.send({ status: { ok, error: "pin not created" } })
        }
      }
    }

    case "DELETE": {
      const resp = await fetch(`${baseUrl}/pins/${req?.body?.pinId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      })

      const ok = resp.ok

      if (resp.ok) {
        return res.send({ status: { ok } })
      } else {
        if (resp.status === 403) {
          return res.send({ status: { ok, error: "user not logged in" } })
        } else {
          console.log("error ")
          return res.send({ status: { ok, error: "pin not deleted" } })
        }
      }
    }
  }
}

export default handler
