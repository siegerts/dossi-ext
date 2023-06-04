import type { PlasmoMessaging } from "@plasmohq/messaging"
import { fetchWithCredentials, handleResponse } from "~lib/background"
import { baseUrl } from "~lib/constants"
import * as z from "zod"

const entityFilterSchema = z.string().url({ message: "Invalid url" })

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  switch (req?.body?.type) {
    case "GET_ENTITY_BY_URL": {
      const filterURL = entityFilterSchema.parse(
        req?.body?.url || req?.sender?.tab?.url
      )
      const url = `${baseUrl}/entities?url=${encodeURIComponent(filterURL)}`
      const resp = await fetchWithCredentials(url, { method: "GET" })

      return handleResponse(resp, res, "GET_ENTITY_BY_URL")
    }

    case "GET": {
      const url = `${baseUrl}/entities`
      const resp = await fetchWithCredentials(url, { method: "GET" })
      return handleResponse(resp, res, "GET")
    }
  }
}

export default handler
