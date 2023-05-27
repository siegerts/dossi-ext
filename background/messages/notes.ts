import type { PlasmoMessaging } from "@plasmohq/messaging"
import * as z from "zod"

const baseUrl =
  process.env.NODE_ENV == "production" || process.env.NODE_ENV == "development"
    ? process.env.PLASMO_PUBLIC_HOST_API
    : "http://locahost:3000/api"

const noteCreateSchema = z.object({
  content: z.string(),
  url: z.string().url({ message: "Invalid url" })
})

const noteFilterSchema = z.string().url({ message: "Invalid url" })

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  switch (req?.body?.type) {
    case "GET_NOTES_BY_URL": {
      // use the body url if passed in,
      // else use the url from the tab that sent the req
      const filterURL = noteFilterSchema.parse(
        req.body.url ? req.body.url : req.sender.tab.url
      )

      console.log(
        "url to send",
        `${baseUrl}/notes?url=${encodeURIComponent(filterURL)}`
      )

      const resp = await fetch(
        `${baseUrl}/notes?url=${encodeURIComponent(filterURL)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        }
      )

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
            status: { ok, error: "notes not available" }
          })
        }
      }
    }

    case "GET": {
      const resp = await fetch(`${baseUrl}/notes`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
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
            status: { ok, error: "notes not available" }
          })
        }
      }
    }

    case "POST": {
      console.log("URL sender", req.sender)

      let resp: Response
      try {
        // validate
        const { content, url } = noteCreateSchema.parse({
          url: req.sender.tab.url,
          content: req.body.content
        })

        resp = await fetch(`${baseUrl}/notes`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            url,
            content
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
        const note = await resp.json()
        return res.send({
          note
        })
      } else {
        if (resp.status === 403) {
          return res.send({ status: { ok, error: "user not logged in" } })
        } else {
          console.log("error ")
          return res.send({ status: { ok, error: "note not created" } })
        }
      }
    }

    case "PATCH": {
      const resp = await fetch(`${baseUrl}/notes/${req?.body?.noteId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: req?.body?.note })
      })

      const ok = resp.ok

      if (resp.ok) {
        const note = await resp.json()
        return res.send({
          note
        })
      } else {
        if (resp.status === 403) {
          return res.send({ status: { ok, error: "user not logged in" } })
        } else {
          console.log("error ")
          return res.send({ status: { ok, error: "note not updated" } })
        }
      }
    }

    case "DELETE": {
      const resp = await fetch(`${baseUrl}/notes/${req?.body?.noteId}`, {
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
          return res.send({ status: { ok, error: "note not deleted" } })
        }
      }
    }
  }
}

export default handler
