import type { PlasmoMessaging } from "@plasmohq/messaging"
import * as z from "zod"
import { baseUrl } from "~lib/constants"

const reminderCreateSchema = z.object({
  at: z.string().datetime(),
  url: z.string().url({ message: "Invalid url" })
})

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  switch (req?.body?.type) {
    case "GET": {
      const resp = await fetch(`${baseUrl}/reminders`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      })

      const ok = resp.ok

      if (resp.ok) {
        const reminders = await resp.json()
        return res.send({ reminders, status: { ok } })
      } else {
        if (resp.status === 403) {
          return res.send({ status: { ok, error: "user not logged in" } })
        } else {
          console.log("error ")
          return res.send({ status: { ok, error: "reminders not available" } })
        }
      }
    }

    case "POST": {
      console.log("URL sender", req.sender)

      let resp: Response
      try {
        // validate
        const { at, url } = reminderCreateSchema.parse({
          at: req.body.at,
          url: req.body.url
        })

        resp = await fetch(`${baseUrl}/reminders`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            at,
            url
          })
        })
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.log("parsing error")
          return res.send({
            status: { ok: false, error: "schema not valid" }
          })
        }
      }

      const ok = resp.ok

      if (resp.ok) {
        const reminder = await resp.json()
        return res.send({
          reminder
        })
      } else {
        if (resp.status === 403) {
          return res.send({ status: { ok, error: "user not logged in" } })
        } else {
          console.log("error ")
          return res.send({ status: { ok, error: "reminder not created" } })
        }
      }
    }

    case "DELETE": {
      const resp = await fetch(`${baseUrl}/reminder/${req?.body?.reminderId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      })

      const ok = resp.ok

      if (resp.ok) {
        return res.send({ status: { ok } })
      } else {
        if (resp.status === 403) {
          return res.send({ status: { ok, error: "user not logged in" } })
        } else {
          console.log("error ")
          return res.send({ status: { ok, error: "reminder not deleted" } })
        }
      }
    }
  }
}

export default handler
