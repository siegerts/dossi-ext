import type { PlasmoMessaging } from "@plasmohq/messaging"
import * as z from "zod"

import {
  createErrorResponse,
  fetchWithCredentials,
  handleResponse,
} from "~lib/background"

import { baseApiUrl } from "~lib/constants"

// title should be passed here but is kept
// optional just in case it's not available
// it won't fail the validation
const pinCreateSchema = z.object({
  url: z.string().trim().url({ message: "Invalid url" }),
  title: z.string().trim().optional(),
})

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  switch (req?.body?.type) {
    case "GET": {
      const url = `${baseApiUrl}/pins`
      const resp = await fetchWithCredentials(url, { method: "GET" })

      return handleResponse(resp, res, "GET")
    }

    case "POST": {
      try {
        const { url, title } = pinCreateSchema.parse({
          url: req.sender.tab.url,
          title: req.body.title,
        })

        const resp = await fetchWithCredentials(`${baseApiUrl}/pins`, {
          method: "POST",
          body: JSON.stringify({ url, title }),
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
        `${baseApiUrl}/pins/${req?.body?.pinId}`,
        {
          method: "DELETE",
        }
      )

      return handleResponse(resp, res, "DELETE")
    }
  }
}

export default handler
