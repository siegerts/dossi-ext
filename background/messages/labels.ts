import type { PlasmoMessaging } from "@plasmohq/messaging"
import {
  fetchWithCredentials,
  handleResponse,
  createErrorResponse
} from "~lib/background"
import { baseUrl } from "~lib/constants"
import * as z from "zod"

const labelCreateSchema = z.object({
  name: z.string().trim().min(1).max(50),
  description: z.string().trim().optional(),
  color: z.string().trim().optional()
})

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  switch (req?.body?.type) {
    case "GET": {
      const url = `${baseUrl}/labels`
      const resp = await fetchWithCredentials(url, { method: "GET" })
      return handleResponse(resp, res, "GET")
    }
    case "POST": {
      try {
        const { name, description, color } = labelCreateSchema.parse({
          name: req?.body?.name,
          description: req?.body?.description,
          color: req?.body?.color
        })

        const resp = await fetchWithCredentials(`${baseUrl}/labels`, {
          method: "POST",
          body: JSON.stringify({ name, description, color })
        })

        return handleResponse(resp, res, "POST")
      } catch (error) {
        if (error instanceof z.ZodError) {
          return createErrorResponse(res, false, "schema not valid")
        }
      }
    }
    case "PATCH": {
      const resp = await fetchWithCredentials(
        `${baseUrl}/labels/${req?.body?.labelId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name: req?.body?.name,
            description: req?.body?.description,
            color: req?.body?.color
          })
        }
      )

      return handleResponse(resp, res, "PATCH")
    }

    case "DELETE": {
      const resp = await fetchWithCredentials(
        `${baseUrl}/labels/${req?.body?.labelId}`,
        {
          method: "DELETE"
        }
      )

      return handleResponse(resp, res, "DELETE")
    }

    // TODO: remove this
    case "SEARCH": {
      // validate the keyword is a string and not empty
      const keyword = z.string().min(1).parse(req?.body?.keyword)

      const resp = await fetchWithCredentials(
        `${baseUrl}/labels/search?q=${encodeURIComponent(keyword)}`,
        {
          method: "GET"
        }
      )

      return handleResponse(resp, res, "SEARCH")
    }
  }
}

export default handler
