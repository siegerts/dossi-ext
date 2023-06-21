import { useState } from "react"
import { useStorage } from "@plasmohq/storage/hook"

import { AuthProvider, useAuth } from "@/contexts/user"
import { EntityProvider, useEntity } from "@/contexts/entity"
import { UserLabelsProvider, useUserLabels } from "~contexts/labels"

import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoCreateShadowRoot,
} from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"
import cssText from "data-text:~/contents/global.css"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"
import { Input } from "@/components/ui/input"
import { Toaster } from "@/components/ui/toaster"
import UserPlan from "~components/UserPlan"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import PinButton from "~components/PinButton"
import Note from "~/components/Note"
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
  SheetTrigger,
} from "@/components/ui/sheet-maintainer"
import "~/contents/base.css"

const queryClient = new QueryClient()

const matches = process.env.PLASMO_PUBLIC_MATCHES.split(",")

export const config: PlasmoCSConfig = {
  matches,
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
    mode: process.env.NODE_ENV == "production" ? "closed" : "open",
  })

export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
  // document.querySelector(process.env.PLASMO_PUBLIC_INLINE_ANCHOR_SELECTOR)
  document.querySelector("#repository-details-container, .gh-header-show")

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
  const user = useAuth()
  const entity = useEntity()
  const { labels } = useUserLabels()
  const [redirect] = useStorage("redirect", { to: null, from: null })

  const [noteContent, setNoteContent] = useState("")

  const [entityTitle, setEntityTitle] = useState("")
  const [isEditingEntityTitle, setIsEditingEntityTitle] = useState(false)
  const [isEntityTitleSaving, setIsEntityTitleSaving] = useState<boolean>(false)

  const [entityUrl, setEntityUrl] = useState(entity?.url)
  const [isEditingEntityUrl, setIsEditingEntityUrl] = useState(false)
  const [isEntityUrlSaving, setIsEntityUrlSaving] = useState<boolean>(false)

  const updateEntityTitle = async () => {
    setIsEntityTitleSaving(true)
    await sendToBackground({
      name: "entities",
      body: {
        type: "PATCH",
        entityId: entity?.id,
        title: entityTitle,
      },
    })
    queryClient.invalidateQueries({ queryKey: ["entity", entity?.url] })
    setIsEntityTitleSaving(false)
  }

  const updateEntityUrl = async (newUrl) => {
    // TODO: update URL but merge notes
    // if there are notes on the new url, merge them with the old ones

    // also, there wont be an entity id if the entity is new
    setIsEntityUrlSaving(true)

    await sendToBackground({
      name: "entities",
      body: {
        type: "PATCH",
        entityId: entity?.id,
        url: newUrl,
      },
    })

    // queryClient.removeQueries({
    //   queryKey: ["entity", entity?.url],
    //   exact: true,
    // })
    queryClient.invalidateQueries({ queryKey: ["entity", newUrl] })
    setIsEntityUrlSaving(false)
  }

  const saveNote = async () => {
    await sendToBackground({
      name: "notes",
      body: {
        type: "POST",
        content: noteContent,
      },
    })
    setNoteContent("")
    queryClient.invalidateQueries({ queryKey: ["notes", entity?.url] })
    queryClient.invalidateQueries({ queryKey: ["entity", entity?.url] })
  }

  return (
    <div>
      {user?.isAuthed ? (
        <Sheet modal={false}>
          {entity.exists && redirect?.to && redirect?.from && (
            <Alert>
              {/* <Terminal className="h-4 w-4" /> */}
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                It looks like this page was renamed or transferred. Would you
                like to update your notes?
                <Button onClick={() => updateEntityUrl(redirect?.to)}>
                  Yes, update my notes
                </Button>
              </AlertDescription>
            </Alert>
          )}
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
              <div className="my-2 flex flex-col">
                <PinButton
                  pinId={
                    entity?.pins && entity?.pins.length == 1
                      ? entity?.pins[0]?.id
                      : null
                  }
                />
              </div>
              <div className="flex flex-col gap-y-2">
                {entity?.title && (
                  <>
                    {entity?.title}
                    {entityTitle}
                    <Input
                      disabled={!isEditingEntityTitle}
                      type="text"
                      placeholder={entity?.title.split("·")[0].trim()}
                      onChange={(e) => {
                        setEntityTitle(e.target.value)
                      }}
                      value={entityTitle}
                    />
                    {!isEditingEntityTitle ? (
                      <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0"
                        onClick={() => setIsEditingEntityTitle(true)}>
                        <Icons.pen className="h-4 w-4" />
                        <span className="sr-only">edit title</span>
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          className="flex h-8 w-8 p-0"
                          onClick={() => {
                            setIsEditingEntityTitle(false)
                            setEntityTitle(entity?.title)
                          }}>
                          <Icons.close className="h-4 w-4" />
                          <span className="sr-only">cancel</span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex h-8 w-8 p-0"
                          onClick={() => {
                            updateEntityTitle()
                            setIsEditingEntityTitle(false)
                          }}>
                          <Icons.check className="h-4 w-4" />
                          <span className="sr-only">save</span>
                        </Button>
                      </>
                    )}
                  </>
                )}

                {entity?.url && (
                  <>
                    <Input
                      disabled
                      type="text"
                      placeholder={new URL(entity?.url).pathname.substring(1)}
                    />
                    <Button variant="ghost" className="flex h-8 w-8 p-0">
                      <Icons.pen className="h-4 w-4" />
                      <span className="sr-only">edit url</span>
                    </Button>
                  </>
                )}
              </div>

              {/* <DatePickerReminderForm
                queryClient={queryClient}
                tabUrl={tabUrl}
              /> */}

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
                      // TODO: add in collapsible
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
