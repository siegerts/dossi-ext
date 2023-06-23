import type { PlasmoMessaging } from "@plasmohq/messaging"
import * as z from "zod"

import { fetchWithCredentials, handleResponse } from "~lib/background"
import { baseApiUrl } from "~lib/constants"
import { entityFilterSchema, entityPatchSchema } from "~lib/validations/entity"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // this is a bit of a hack, but it works
  // if there is no cookie, then no user
  // this will stop the window focus events
  // from triggering unauthed requests after logout
  const cookie = await chrome.cookies.get({
    url: process.env.PLASMO_PUBLIC_HOST,
    name: "__Secure-next-auth.session-token",
  })
  if (!cookie) {
    return
  }

  switch (req?.body?.type) {
    case "GET_ENTITY_BY_URL": {
      const filter = entityFilterSchema.parse(
        req?.body?.url || req?.sender?.tab?.url
      )
      const url = `${baseApiUrl}/entities?url=${encodeURIComponent(filter)}`
      const resp = await fetchWithCredentials(url, { method: "GET" })

      return handleResponse(resp, res, "GET_ENTITY_BY_URL")
    }

    case "GET": {
      const url = `${baseApiUrl}/entities`
      const resp = await fetchWithCredentials(url, { method: "GET" })
      return handleResponse(resp, res, "GET")
    }

    case "PATCH": {
      try {
        const entityPatch = entityPatchSchema.parse({
          title: req?.body?.title,
          url: req?.body?.url,
        })

        const resp = await fetch(
          `${baseApiUrl}/entities/${req?.body?.entityId}`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...entityPatch,
            }),
          }
        )

        const ok = resp.ok

        if (resp.ok) {
          return res.send({ status: { ok } })
        } else {
          if (resp.status === 403) {
            return res.send({ status: { ok, error: "user not logged in" } })
          } else {
            console.log("error ")
            return res.send({ status: { ok, error: "entity not updated" } })
          }
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.send({
            status: { ok: false, error: "schema not valid" },
          })
        }
      }
    }
  }
}

export default handler
