import { useState } from "react"
import { AuthProvider, useAuth } from "@/contexts/user"
import { EntityProvider, useEntity } from "@/contexts/entity"
import { UserLabelsProvider, useUserLabels } from "~contexts/labels"

import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoCreateShadowRoot
} from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"
import cssText from "data-text:~/contents/global.css"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"
import { Toaster } from "@/components/ui/toaster"
import UserPlan from "~components/UserPlan"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import PinButton from "~components/PinButton"
import Note from "@/components/Note"
import LabelList from "~components/LabelList"
import LabelAdd from "~components/LabelAdd"

import { baseApiUrl } from "~lib/constants"

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

const queryClient = new QueryClient()

const matches = process.env.PLASMO_PUBLIC_MATCHES.split(",")

export const config: PlasmoCSConfig = {
  matches
}

// Inject into the ShadowDOM
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const getShadowHostId = () =>
  `${process.env.PLASMO_PUBLIC_SHIP_NAME}-cc-sidebar`

export const createShadowRoot: PlasmoCreateShadowRoot = (shadowHost) =>
  shadowHost.attachShadow({
    mode: process.env.NODE_ENV == "production" ? "closed" : "open"
  })

export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
  document.querySelector(process.env.PLASMO_PUBLIC_INLINE_ANCHOR_SELECTOR)

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <UserLabelsProvider>
          <EntityProvider>
            <ActionSheet />
            <ReactQueryDevtools initialIsOpen={false} />
          </EntityProvider>
        </UserLabelsProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

const ActionSheet = () => {
  const [noteContent, setNoteContent] = useState("")

  const user = useAuth()
  const entity = useEntity()
  const { labels } = useUserLabels()

  const saveNote = async () => {
    await sendToBackground({
      name: "notes",
      body: {
        type: "POST",
        content: noteContent
      }
    })
    setNoteContent("")
    queryClient.invalidateQueries({ queryKey: ["notes", entity?.url] })
    queryClient.invalidateQueries({ queryKey: ["entity", entity?.url] })
  }

  return (
    <div>
      {user?.isAuthed ? (
        <Sheet modal={false}>
          <SheetTrigger asChild className="justify-end">
            <Button>
              <Icons.logo className="mr-2 h-4 w-4" />
              {process.env.PLASMO_PUBLIC_SHIP_NAME}-{user?.attrs?.name}
              {entity?.id && entity?.notes && (
                <span className="ml-2 rounded-full bg-gray-200 px-1 text-xs text-gray-500">
                  {entity?.notes?.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent size="lg">
            <SheetHeader className="text-left">
              <SheetTitle>
                Add Note
                <UserPlan />
              </SheetTitle>
              <SheetDescription>
                Make changes to your notes here.
              </SheetDescription>
            </SheetHeader>

            <div className="gap-4 py-4">
              {entity?.title && <span>{entity?.title}</span>}
              {entity?.url && (
                <span>{new URL(entity?.url).pathname.substring(1)}</span>
              )}

              {/* <DatePickerReminderForm
                queryClient={queryClient}
                tabUrl={tabUrl}
              /> */}

              <div className="flex flex-col">
                <PinButton
                  pinId={
                    entity?.pins && entity?.pins.length == 1
                      ? entity?.pins[0]?.id
                      : null
                  }
                />
              </div>

              <div className="mb-2 grid gap-2">
                {entity?.status === "loading" && <p>Loading...</p>}
                {entity?.status === "error" && <p>Error loading</p>}
                {entity?.status === "success" && entity?.exists && (
                  <>
                    <div className="flex flex-wrap items-center gap-2 py-4">
                      <LabelList labels={entity?.labels} />
                      <LabelAdd labels={labels} />
                    </div>
                    {entity?.id ? (
                      <>
                        {entity?.notes.map((note: any) => (
                          <Note key={note?.id} note={note} />
                        ))}
                      </>
                    ) : (
                      <p>No notes yet..</p>
                    )}
                  </>
                )}
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  placeholder="Add your note here."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="submit" onClick={saveNote}>
                  Save note
                </Button>
              </div>
            </div>

            <SheetFooter></SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
        <Button asChild>
          <a href={`${baseApiUrl}/auth/signin`} target="_blank">
            <Icons.logo className="mr-2 h-4 w-4" />
            {process.env.PLASMO_PUBLIC_SHIP_NAME}
          </a>
        </Button>
      )}

      <Toaster />
    </div>
  )
}

export default App
