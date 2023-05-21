import type { PlasmoMessaging } from "@plasmohq/messaging"
import * as z from "zod"

const baseUrl =
  process.env.NODE_ENV == "production" || process.env.NODE_ENV == "development"
    ? "https://maintainer.cc/api"
    : "http://locahost:3000/api"

const noteCreateSchema = z.object({
  content: z.string().optional(),
  url: z.string().url({ message: "Invalid url" })
})

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  if (req?.body?.type === "GET") {
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
      return await res.send({ notes, status: { ok } })
    } else {
      if (resp.status === 403) {
        return await res.send({ status: { ok, error: "user not logged in" } })
      } else {
        console.log("error ")
        return await res.send({ status: { ok, error: "notes not available" } })
      }
    }

    //
  } else if (req?.body?.type === "POST") {
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
      return await res.send({
        note
      })
    } else {
      if (resp.status === 403) {
        return await res.send({ status: { ok, error: "user not logged in" } })
      } else {
        console.log("error ")
        return await res.send({ status: { ok, error: "note not created" } })
      }
    }
  } else if (req?.body?.type === "PATCH") {
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
      return await res.send({
        note
      })
    } else {
      if (resp.status === 403) {
        return await res.send({ status: { ok, error: "user not logged in" } })
      } else {
        console.log("error ")
        return await res.send({ status: { ok, error: "note not updated" } })
      }
    }
  } else if (req?.body?.type === "DELETE") {
    const resp = await fetch(`${baseUrl}/notes/${req?.body?.noteId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    })

    const ok = resp.ok

    if (resp.ok) {
      return await res.send({ status: { ok } })
    } else {
      if (resp.status === 403) {
        return await res.send({ status: { ok, error: "user not logged in" } })
      } else {
        console.log("error ")
        return await res.send({ status: { ok, error: "note not deleted" } })
      }
    }
  }
}

export default handler
