import type { PlasmoMessaging } from "@plasmohq/messaging"
import * as z from "zod"

import {
  createErrorResponse,
  fetchWithCredentials,
  handleResponse,
} from "~lib/background"
import { baseApiUrl } from "~lib/constants"

const labelsOnEntitiesSchema = z.object({
  entityId: z.string().trim(),
  labelId: z.string().trim(),
})

// TODO: what if there isnt an entity yet
// current state - label picker is disabled
// until an entity is created
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  switch (req?.body?.type) {
    case "ADD_LABEL_TO_ENTITY": {
      try {
        const { entityId, labelId } = labelsOnEntitiesSchema.parse({
          entityId: req?.body?.entityId,
          labelId: req?.body?.labelId,
        })

        const resp = await fetchWithCredentials(
          `${baseApiUrl}/entities/${entityId}/labels/${labelId}`,
          {
            method: "PUT",
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
          labelId: req?.body?.labelId,
        })

        const resp = await fetchWithCredentials(
          `${baseApiUrl}/entities/${entityId}/labels/${labelId}`,
          {
            method: "DELETE",
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
