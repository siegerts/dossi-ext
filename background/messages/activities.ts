import type { PlasmoMessaging } from "@plasmohq/messaging"

import { createErrorResponse, fetchWithCredentials } from "~lib/background"
import { baseApiUrl } from "~lib/constants"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  switch (req?.body?.type) {
    case "GET": {
      const url = `${baseApiUrl}/activity`
      const resp = await fetchWithCredentials(url, { method: "GET" })

      const ok = resp.ok

      if (resp.ok) {
        const data = await resp.json()

        return res.send({ data, status: { ok } })
      } else {
        const error =
          resp.status === 403 ? "user not logged in" : `GET action failed`
        return createErrorResponse(res, ok, error)
      }
    }
  }
}

export default handler
