import { useState, useEffect } from "react"
import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoCreateShadowRoot
} from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"
import cssText from "data-text:~/contents/global.css"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"
import { Toaster } from "@/components/ui/toaster"

import {
  QueryClient,
  useQuery,
  QueryClientProvider
} from "@tanstack/react-query"

import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import PinButton from "~components/PinButton"
import Notes from "@/components/Notes"
import Note from "@/components/Note"
import LabelList from "~components/LabelList"

import LabelAdd from "~components/LabelAdd"

import { DatePickerReminderForm } from "@/components/ReminderForm"
import { baseUrl } from "~lib/constants"

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
import { set } from "date-fns"

type EntityItem = {
  id: string
  url: string
}

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
    <QueryClientProvider client={queryClient}>
      <ActionSheet />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

const ActionSheet = () => {
  const [noteContent, setNoteContent] = useState("")
  const [tabUrl, setTabUrl] = useState("")
  const [tabTitle, setTabTitle] = useState("")
  const [authedUser, setAuthedUser] = useStorage("user")

  useEffect(() => {
    const handleRequest = async (req: any) => {
      if (req.type === "URL_CHANGE") {
        const { url, title } = await sendToBackground({
          name: "tab" as never
        })
        setTabUrl(url)
        setTabTitle(title)
      }
    }

    const init = async () => {
      const { user, status } = await sendToBackground({
        name: "user" as never
      })

      setAuthedUser(user.user)
    }

    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      handleRequest(request).then((response) => sendResponse(response))
      return true
    })

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        init()
      }
    })

    init()
  }, [])

  const entity = useQuery(["entity", tabUrl], async () => {
    try {
      let { data, status } = await sendToBackground({
        name: "entities" as never,
        body: {
          type: "GET_ENTITY_BY_URL",
          url: tabUrl
        }
      })

      if (status.ok) {
        console.log(data)
        return data
      } else {
        throw Error(status.error)
      }
    } catch (err) {
      throw Error(err)
    }
  })

  const labels = useQuery(["labels"], async () => {
    try {
      let { data, status } = await sendToBackground({
        name: "labels" as never,
        body: {
          type: "GET"
        }
      })

      if (status.ok) {
        console.log(data)
        return data
      } else {
        throw Error(status.error)
      }
    } catch (err) {
      throw Error(err)
    }
  })

  const saveNote = async () => {
    await sendToBackground({
      name: "notes",
      body: {
        type: "POST",
        content: noteContent
      }
    })
    setNoteContent("")
    queryClient.invalidateQueries({ queryKey: ["notes", tabUrl] })
    queryClient.invalidateQueries({ queryKey: ["entity", tabUrl] })
  }

  return (
    <div>
      {authedUser ? (
        <Sheet modal={false}>
          <SheetTrigger asChild className="justify-end">
            <Button>
              <Icons.logo className="mr-2 h-4 w-4" />
              {process.env.PLASMO_PUBLIC_SHIP_NAME}-{authedUser?.attrs?.name}
              {entity?.data?.notes?.length > 0 && (
                <span className="ml-2 rounded-full bg-gray-200 px-1 text-xs text-gray-500">
                  {entity?.data?.notes?.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent size="lg">
            <SheetHeader className="text-left">
              <SheetTitle>Add Note</SheetTitle>
              <SheetDescription>
                Make changes to your notes here.
              </SheetDescription>
            </SheetHeader>

            <div className="grid gap-4 py-4">
              {tabTitle && <span>{tabTitle}</span>}
              {tabUrl && <span>{new URL(tabUrl).pathname.substring(1)}</span>}

              <DatePickerReminderForm
                queryClient={queryClient}
                tabUrl={tabUrl}
              />

              <PinButton
                queryClient={queryClient}
                pinId={entity?.data?.pins[0] ? entity?.data?.pins[0]?.id : null}
              />

              <div className="flex items-center space-x-2 pt-4">
                <LabelList labels={labels} queryClient={queryClient} />
                <LabelAdd labels={labels} queryClient={queryClient} />
               
              </div>

              <div className="mb-2 grid gap-2">
                {entity?.status === "loading" && <p>Loading...</p>}
                {entity?.status === "error" && <p>Error loading</p>}
                {entity?.status === "success" && (
                  <>
                    {entity?.data ? (
                      <>
                        {entity?.data?.notes.map((note: any) => (
                          <Note
                            key={note?.id}
                            note={note}
                            queryClient={queryClient}
                            tabUrl={tabUrl}
                          />
                        ))}
                      </>
                    ) : (
                      <p>No entity yet</p>
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
              <Button type="submit" onClick={saveNote}>
                Save note
              </Button>
            </div>

            <SheetFooter>
              {/* <Button type="submit" onClick={saveNote}>
                Save note
              </Button> */}
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
        <Button asChild>
          <a href={`${baseUrl}/auth/signin`} target="_blank">
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
