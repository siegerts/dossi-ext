import type { PlasmoMessaging } from "@plasmohq/messaging"
import {
  fetchWithCredentials,
  handleResponse,
  createErrorResponse
} from "~lib/background"
import { baseUrl } from "~lib/constants"
import * as z from "zod"

const pinCreateSchema = z.object({
  url: z.string().url({ message: "Invalid url" })
})

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  switch (req?.body?.type) {
    case "GET": {
      const url = `${baseUrl}/pins`
      const resp = await fetchWithCredentials(url, { method: "GET" })
      return handleResponse(resp, res, "GET")
    }

    case "POST": {
      try {
        const { url } = pinCreateSchema.parse({
          url: req.sender.tab.url
        })

        const resp = await fetchWithCredentials(`${baseUrl}/pins`, {
          method: "POST",
          body: JSON.stringify({ url })
        })

        return handleResponse(resp, res, "POST")
      } catch (error) {
        if (error instanceof z.ZodError) {
          return createErrorResponse(res, false, "schema not valid")
        }
      }
    }

    case "DELETE": {
      const resp = await fetchWithCredentials(
        `${baseUrl}/pins/${req?.body?.pinId}`,
        {
          method: "DELETE"
        }
      )

      return handleResponse(resp, res, "DELETE")
    }
  }
}

export default handler
