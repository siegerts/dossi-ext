import { useState } from "react"
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

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import Pins from "@/components/Pins"
import Notes from "@/components/Notes"

const queryClient = new QueryClient()

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

export const createShadowRoot: PlasmoCreateShadowRoot = (shadowHost) =>
  shadowHost.attachShadow({
    mode: process.env.NODE_ENV == "production" ? "closed" : "open"
  })

export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
  document.querySelector("#partial-discussion-header > div.gh-header-show")

const MaintainerSidebar = () => {
  const [noteContent, setNoteContent] = useState("")

  const saveNote = async (note) => {
    const resp = await sendToBackground({
      name: "notes",
      body: {
        type: "POST",
        content: noteContent
      }
    })
    setNoteContent("")
    console.log(resp)
    queryClient.invalidateQueries({ queryKey: ["notes"] })
  }

  return (
    <QueryClientProvider client={queryClient}>
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
              <Button type="submit" onClick={saveNote}>
                Save note
              </Button>
              <Notes />
              {/* <Pins /> */}
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  placeholder="Add your note here."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </div>
            </div>
            <SheetFooter>
              {/* <Button type="submit" onClick={saveNote}>
                Save note
              </Button> */}
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default MaintainerSidebar
