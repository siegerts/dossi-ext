import type { PlasmoMessaging } from "@plasmohq/messaging"
import * as z from "zod"

const baseUrl =
  process.env.NODE_ENV == "production" || process.env.NODE_ENV == "development"
    ? "https://maintainer.cc/api"
    : "http://locahost:3000/api"

const reminderCreateSchema = z
  .object({
    at: z.string().datetime(),
    note: z.string().optional(),
    pin: z.string().optional()
  })
  .refine((data) => Boolean(data.note) || Boolean(data.pin), {
    message: "At least one of `note` or `pin` must be provided",
    path: ["note", "pin"]
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
        resp = await fetch(`${baseUrl}/reminders`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            url: req.sender.tab.url,
            at: req.body.content,
            note: req.body.noteId,
            pin: req.body.pinId
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
        const pin = await resp.json()
        return res.send({
          pin
        })
      } else {
        if (resp.status === 403) {
          return res.send({ status: { ok, error: "user not logged in" } })
        } else {
          console.log("error ")
          return res.send({ status: { ok, error: "pin not created" } })
        }
      }
    }

    case "DELETE": {
      const resp = await fetch(`${baseUrl}/pins/${req?.body?.pinId}`, {
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
          return res.send({ status: { ok, error: "pin not deleted" } })
        }
      }
    }
  }
}

export default handler
