import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import * as z from "zod"

import {
  createErrorResponse,
  fetchWithCredentials,
  handleResponse,
} from "~lib/background"
import { baseApiUrl } from "~lib/constants"

const storage = new Storage({
  area: "local",
})

const labelCreateSchema = z.object({
  name: z.string().trim().min(1).max(50),
  description: z.string().trim().optional(),
})

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  switch (req?.body?.type) {
    case "GET": {
      const cachedLabels = await storage.get("labels")
      if (cachedLabels) {
        console.log("using labels from cache")
        const data = await storage.get("labels")
        return res.send({ data, status: { ok: true } })
      }

      const url = `${baseApiUrl}/labels`
      const resp = await fetchWithCredentials(url, { method: "GET" })

      const ok = resp.ok

      if (resp.ok) {
        const data = await resp.json()
        console.log("rehydrating labels cache")
        await storage.set("labels", data)

        return res.send({ data, status: { ok } })
      } else {
        const error =
          resp.status === 403 ? "user not logged in" : `GET action failed`
        return createErrorResponse(res, ok, error)
      }
    }
    case "POST": {
      try {
        const { name, description } = labelCreateSchema.parse({
          name: req?.body?.name,
          description: req?.body?.description,
        })

        const resp = await fetchWithCredentials(`${baseApiUrl}/labels`, {
          method: "POST",
          body: JSON.stringify({ name, description }),
        })

        const ok = resp.ok

        if (resp.ok) {
          try {
            await storage.remove("labels")

            const data = await resp.json()
            return res.send({ data, status: { ok } })
          } catch (error) {
            // no data returned
            return res.send({ status: { ok } })
          }
        } else {
          const error =
            resp.status === 403 ? "user not logged in" : `POST action failed`
          return createErrorResponse(res, ok, error)
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return createErrorResponse(res, false, "schema not valid")
        }
      }
    }
    case "PATCH": {
      const { name, description } = labelCreateSchema.parse({
        name: req?.body?.name,
        description: req?.body?.description,
      })

      try {
        const resp = await fetchWithCredentials(
          `${baseApiUrl}/labels/${req?.body?.labelId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              name,
              description,
            }),
          }
        )

        const ok = resp.ok

        if (resp.ok) {
          try {
            await storage.remove("labels")

            const data = await resp.json()

            return res.send({ data, status: { ok } })
          } catch (error) {
            // no data returned
            return res.send({ status: { ok } })
          }
        } else {
          const error =
            resp.status === 403 ? "user not logged in" : `PATCH action failed`
          return createErrorResponse(res, ok, error)
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return createErrorResponse(res, false, "schema not valid")
        }
      }
    }

    case "DELETE": {
      const resp = await fetchWithCredentials(
        `${baseApiUrl}/labels/${req?.body?.labelId}`,
        {
          method: "DELETE",
        }
      )

      const ok = resp.ok

      if (resp.ok) {
        try {
          await storage.remove("labels")

          const data = await resp.json()

          return res.send({ data, status: { ok } })
        } catch (error) {
          // no data returned
          return res.send({ status: { ok } })
        }
      } else {
        const error =
          resp.status === 403 ? "user not logged in" : `DELETE action failed`
        return createErrorResponse(res, ok, error)
      }
    }
  }
}

export default handler
