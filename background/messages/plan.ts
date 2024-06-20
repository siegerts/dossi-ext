import type { PlasmoMessaging } from "@plasmohq/messaging"

import { baseApiUrl } from "~lib/constants"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  switch (req?.body?.type) {
    case "GET": {
      const resp = await fetch(`${baseApiUrl}/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const ok = resp.ok

      if (resp.ok) {
        const me = await resp.json()
        return res.send({ data: me, status: { ok } })
      } else {
        if (resp.status === 403) {
          return res.send({ status: { ok, error: "user not logged in" } })
        } else {
          console.log("error ")
          return res.send({
            data: {},
            status: { ok, error: "data not available" },
          })
        }
      }
    }
  }
}

export default handler
