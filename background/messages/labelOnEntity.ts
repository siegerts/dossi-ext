import type { PlasmoMessaging } from "@plasmohq/messaging"
import {
  fetchWithCredentials,
  handleResponse,
  createErrorResponse
} from "~lib/background"
import { baseUrl } from "~lib/constants"
import * as z from "zod"

const labelsOnEntitiesSchema = z.object({
  entityId: z.string().trim(),
  labelId: z.string().trim()
})

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  switch (req?.body?.type) {
    case "ADD_LABEL_TO_ENTITY": {
      try {
        const { entityId, labelId } = labelsOnEntitiesSchema.parse({
          entityId: req?.body?.entityId,
          labelId: req?.body?.labelId
        })

        const resp = await fetchWithCredentials(
          `${baseUrl}/entities/${entityId}/labels/${labelId}`,
          {
            method: "PUT"
          }
        )

        return handleResponse(resp, res, "PUT")
      } catch (error) {
        if (error instanceof z.ZodError) {
          return createErrorResponse(res, false, "schema not valid")
        }
      }
    }

    case "DELETE_LABEL_FROM_ENTITY": {
      try {
        const { entityId, labelId } = labelsOnEntitiesSchema.parse({
          entityId: req?.body?.entityId,
          labelId: req?.body?.labelId
        })

        const resp = await fetchWithCredentials(
          `${baseUrl}/entities/${entityId}/labels/${labelId}`,
          {
            method: "DELETE"
          }
        )

        return handleResponse(resp, res, "DELETE")
      } catch (error) {
        if (error instanceof z.ZodError) {
          return createErrorResponse(res, false, "schema not valid")
        }
      }
    }
  }
}

export default handler
