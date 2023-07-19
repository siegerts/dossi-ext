import type { PlasmoMessaging } from "@plasmohq/messaging"
import * as z from "zod"

import { baseApiUrl } from "~lib/constants"
import {
  noteCreateSchema,
  notePatchSchema,
  notesTransferSchema,
} from "~lib/validations/note"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  switch (req?.body?.type) {
    case "GET": {
      const resp = await fetch(`${baseApiUrl}/notes`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const ok = resp.ok

      if (resp.ok) {
        const notes = await resp.json()
        return res.send({ notes, status: { ok } })
      } else {
        if (resp.status === 403) {
          return res.send({ status: { ok, error: "user not logged in" } })
        } else {
          console.log("error ")
          return res.send({
            status: { ok, error: "notes not available" },
          })
        }
      }
    }

    case "POST": {
      try {
        // validate
        const { content, title, url } = noteCreateSchema.parse({
          url: req.sender.tab.url,
          title: req.body.title,
          content: req.body.content,
        })

        let resp = await fetch(`${baseApiUrl}/notes`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            title,
            content,
          }),
        })

        const ok = resp.ok

        if (resp.ok) {
          const note = await resp.json()
          return res.send({ note, status: { ok } })
        } else {
          if (resp.status === 403) {
            return res.send({ status: { ok, error: "user not logged in" } })
          } else {
            console.log("error ")
            return res.send({ status: { ok, error: "note not created" } })
          }
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.log(error)
          return res.send({
            status: { ok: false, error: "schema not valid" },
          })
        }
      }
    }

    case "PATCH": {
      try {
        const { content } = notePatchSchema.parse({
          content: req?.body?.content,
        })

        const resp = await fetch(`${baseApiUrl}/notes/${req?.body?.noteId}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        })

        const ok = resp.ok

        if (resp.ok) {
          return res.send({ status: { ok } })
        } else {
          if (resp.status === 403) {
            return res.send({ status: { ok, error: "user not logged in" } })
          } else {
            console.log("error ")
            return res.send({ status: { ok, error: "note not updated" } })
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

    case "DELETE": {
      const resp = await fetch(`${baseApiUrl}/notes/${req?.body?.noteId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const ok = resp.ok

      if (resp.ok) {
        return res.send({ status: { ok } })
      } else {
        if (resp.status === 403) {
          return res.send({ status: { ok, error: "user not logged in" } })
        } else {
          console.log("error ")
          return res.send({ status: { ok, error: "note not deleted" } })
        }
      }
    }

    case "TRANSFER": {
      try {
        const { url, title, from, to } = notesTransferSchema.parse({
          url: req.sender.tab.url,
          title: req.body.title,
          from: req.body.from,
          to: req.body.to,
        })

        let resp = await fetch(`${baseApiUrl}/notes/transfer`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            title,
            from,
            to,
          }),
        })

        const ok = resp.ok

        if (resp.ok) {
          return res.send({ status: { ok } })
        } else {
          if (resp.status === 403) {
            return res.send({ status: { ok, error: "user not logged in" } })
          } else {
            console.log("error ")
            return res.send({ status: { ok, error: "notes not transferred" } })
          }
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.log(error)
          return res.send({
            status: { ok: false, error: "schema not valid" },
          })
        }
      }
    }
  }
}

export default handler
