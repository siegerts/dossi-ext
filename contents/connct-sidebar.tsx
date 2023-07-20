import { useState, useEffect } from "react"

import type {
  PlasmoCSConfig,
  PlasmoCreateShadowRoot,
  PlasmoGetInlineAnchor,
} from "plasmo"

import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"
import { EntityProvider, useEntity } from "@/contexts/entity"
import { AuthProvider, useAuth } from "@/contexts/user"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet-maintainer"
import { Textarea } from "@/components/ui/textarea"

import NoteList from "@/components/note-list"
import PinButton from "@/components/pin-button"
import RedirectedNotes from "@/components/redirected-notes"
import UserPlan from "@/components/user-plan"
// import UserRole from "@/components/user-role"
import { Icons } from "@/components/icons"
import { UserLabelsProvider } from "@/contexts/labels"
import { PlanDataProvider, usePlanData } from "@/contexts/plan"
import { baseApiUrl } from "@/lib/constants"
import { limitReached } from "@/lib/utils"

import "~/contents/base.css"
import cssText from "data-text:~/contents/global.css"

const queryClient = new QueryClient()

export const config: PlasmoCSConfig = {
  matches: ["https://github.com/*"],
}

// Inject into the ShadowDOM
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const getShadowHostId = () => `${process.env.PLASMO_PUBLIC_SHIP_NAME}-sb`

export const createShadowRoot: PlasmoCreateShadowRoot = (shadowHost) =>
  shadowHost.attachShadow({
    mode: process.env.NODE_ENV == "production" ? "closed" : "open",
  })

export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
  document.querySelector("#repository-details-container, .gh-header-show")

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <PlanDataProvider>
          <UserLabelsProvider>
            <EntityProvider>
              <ActionSheet />
              <ReactQueryDevtools initialIsOpen={false} />
            </EntityProvider>
          </UserLabelsProvider>
        </PlanDataProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

const ActionSheet = () => {
  const user = useAuth()
  const entity = useEntity()
  const { counts, limits } = usePlanData()

  const [redirect] = useStorage("redirect", { to: null, from: null })

  const [noteContent, setNoteContent] = useState<string>("")

  const [entityTitle, setEntityTitle] = useState<string>(entity?.title)
  const [isEditingEntityTitle, setIsEditingEntityTitle] =
    useState<boolean>(false)
  const [isEntityTitleSaving, setIsEntityTitleSaving] = useState<boolean>(false)
  const [redirectedEntity, setRedirectedEntity] = useState<any>(null)

  useEffect(() => {
    const checkRedirectNotes = async () => {
      if (!redirect?.to || !redirect?.from) {
        setRedirectedEntity({ to: null, from: null })
        return
      }

      const res = await sendToBackground({
        name: "entities",
        body: {
          type: "GET_ENTITY_BY_URL",
          url: redirect?.from,
        },
      })

      setRedirectedEntity(res?.data)
    }
    checkRedirectNotes()
  }, [redirect?.to, redirect?.from])

  const updateEntityTitle = async () => {
    if (!entityTitle || entityTitle == entity?.title) return

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

  const createNote = async () => {
    if (!noteContent.trim()) return
    if (limitReached(counts, limits, "notes")) return

    await sendToBackground({
      name: "notes",
      body: {
        type: "POST",
        ...(!entity?.exists && { title: entity?.title }),
        content: noteContent.trim(),
      },
    })
    setNoteContent("")
    queryClient.invalidateQueries({ queryKey: ["entity", entity?.url] })
    queryClient.invalidateQueries({ queryKey: ["plan"] })
  }

  return (
    <div>
      {user?.isAuthed ? (
        <Sheet modal={false}>
          <SheetTrigger asChild className="justify-end">
            <Button variant="default" className="border-primary-text border">
              <Icons.logo className="mr-2 h-4 w-4" />
              {process.env.PLASMO_PUBLIC_SHIP_NAME}-{user?.attrs?.name}
              {entity?.id && entity?.notes && (
                <span className="ml-2 rounded-full bg-gray-200 px-2 text-xs text-gray-500">
                  {entity?.notes?.length}
                </span>
              )}
              {redirectedEntity && redirectedEntity?.notes?.length > 0 && (
                <Icons.alertTriangle className="ml-2 h-4 w-4" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent size="lg" className="!bg-white !text-black">
            <SheetHeader className="text-left">
              <SheetTitle>
                <div className="flex items-center justify-between">
                  <h2>dossi</h2>
                  {/* <UserRole /> */}
                  <UserPlan />
                </div>
              </SheetTitle>
              <SheetDescription>{/* this is a <p></p> */}</SheetDescription>

              {entity?.url && (
                <div className="my-2 flex items-center justify-between gap-2">
                  <div>
                    <span>{new URL(entity?.url).pathname.substring(1)}</span>
                  </div>

                  <PinButton
                    pinId={
                      entity?.pins && entity?.pins.length == 1
                        ? entity?.pins[0]?.id
                        : null
                    }
                  />
                </div>
              )}

              {redirectedEntity && redirectedEntity?.notes?.length > 0 && (
                <RedirectedNotes
                  entity={entity}
                  redirectedEntity={redirectedEntity}
                />
              )}
            </SheetHeader>

            <div className="gap-4 py-4">
              <div className="flex flex-col gap-y-2">
                {entity?.title && (
                  <>
                    <Label htmlFor="title">Title</Label>
                    <div className="flex items-center gap-2">
                      {entity?.exists ? (
                        <>
                          {isEditingEntityTitle ? (
                            <Input
                              id="title"
                              type="text"
                              placeholder={entity?.title}
                              onChange={(e) => {
                                setEntityTitle(e.target.value)
                              }}
                            />
                          ) : (
                            <div>
                              <span>{entity?.title}</span>
                            </div>
                          )}
                          {!isEditingEntityTitle ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex h-8 w-8 p-0"
                              onClick={() => setIsEditingEntityTitle(true)}>
                              <Icons.pen className="h-4 w-4" />
                              <span className="sr-only">edit title</span>
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
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
                      ) : (
                        <div>
                          <span>{entity?.title}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <NoteList />

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="note">Add note</Label>
                <Textarea
                  className="mt-1"
                  autoFocus={true}
                  disabled={limitReached(counts, limits, "notes")}
                  id="note"
                  placeholder="Add your thoughts here..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  type="submit"
                  onClick={createNote}
                  disabled={limitReached(counts, limits, "notes")}>
                  {limitReached(counts, limits, "notes")
                    ? "Upgrade to save"
                    : "Save note"}
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
    </div>
  )
}

export default App
