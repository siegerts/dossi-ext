import { useEffect, useState } from "react"
import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoCreateShadowRoot
} from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"
import cssText from "data-text:~/contents/global.css"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet-maintainer"

import "~/contents/base.css"

export const config: PlasmoCSConfig = {
  matches: [
    "https://github.com/*",
    "https://maintainer.cc/*"
    // "http://localhost:3000/*"
  ]
}

// Inject into the ShadowDOM
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const getShadowHostId = () => "maintainer-cc-sidebar"

console.log(process.env.NODE_ENV)
export const createShadowRoot: PlasmoCreateShadowRoot = (shadowHost) =>
  shadowHost.attachShadow({
    mode: process.env.NODE_ENV == "production" ? "closed" : "open"
  })

export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
  document.querySelector("#partial-discussion-header > div.gh-header-show")

const MaintainerSidebar = () => {
  const [message, setMessage] = useState("")
  const [csrfToken, setCsrfToken] = useState("")
  const [session, setSession] = useState("")

  const [notes, setNotes] = useState(null)

  const getNotes = async () => {
    console.log("getting triage message")
    const resp = await sendToBackground({
      name: "notes",
      body: {
        type: "get"
      }
    })
    console.log("received triage message")
    console.log(resp)
    setNotes(resp.notes)
  }

  const saveNote = async () => {
    const resp = await sendToBackground({
      name: "notes",
      body: {
        type: "post",
        content: "this is a test message."
      }
    })
    console.log(resp)
  }

  // useEffect(() => {
  //   document.body.classList.toggle("plasmo-google-sidebar-show", isOpen)
  // }, [isOpen])

  return (
    <div>
      <Sheet modal={false}>
        <SheetTrigger asChild className="justify-end">
          <Button>
            <Icons.logo className="mr-2 h-4 w-4" />
            Maintainer
          </Button>
        </SheetTrigger>
        <SheetContent position="bottom" size="lg">
          <SheetHeader className="text-left">
            <SheetTitle>Add Note</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            {/* <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" placeholder="Email" />
                </div> */}
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="note">Note</Label>
              <Textarea id="note" placeholder="Add your note here." />
            </div>
          </div>
          <SheetFooter>
            <Button type="submit" onClick={saveNote}>
              Save note
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default MaintainerSidebar
