import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/user"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"
import { Card } from "@/components/ui/card"
import OpenAI from "openai"
import type { ChatCompletionMessageParam } from "openai/resources/chat"
import turnDownService from "turndown"
import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import type { Entity, Tab } from "~types/entity"
import type { UserSettings } from "~types/user"

import "~/contents/base.css"
import cssText from "data-text:~/styles/globals.css"

type IEntity = Entity & Tab

// Inject into the ShadowDOM
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const markdown = new turnDownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-",
  linkReferenceStyle: "shortcut",
})

markdown.remove(["script", "style"])

markdown.addRule("removeRelativeLinks", {
  filter: "a",
  replacement: function (content, node) {
    const href = node.getAttribute("href")
    // remove relative links
    if (href.startsWith("#") || href.startsWith("/")) {
      return content
    }

    if ((href.split("/")[3] = content.split("@")[1])) {
      return content
    }

    return "[" + content + "](" + href + ")"
  },
})

markdown.addRule("removeImages", {
  filter: "img",
  replacement: function (content, node) {
    const src = node.getAttribute("src")
    // avatar links
    if (src.startsWith("https://avatars.githubusercontent.com")) {
      return ""
    }
    return ""
  },
})

function Prompts({ entity }: { entity: IEntity }) {
  const [isIssueOrDiscussion, setIsIssueOrDiscussion] = useState(false)
  const [loadingPromptResponse, setLoadingPromptResponse] = useState(false)
  const [loadingNote, setLoadingNote] = useState(false)
  const [promptResponseContent, setPromptResponseContent] = useState("")
  const [settings, setSettings] = useStorage<any[]>({
    key: "settings",
    instance: new Storage({
      area: "local",
    }),
  })
  const [userSettings, setUserSettings] = useState<UserSettings>()
  const textareaRef = useRef(null)
  const client = useQueryClient()
  const user = useAuth()

  async function documentToMarkdown() {
    let doc = document.getElementsByTagName("main")[0]

    let cpy: HTMLElement = doc.cloneNode(true) as HTMLElement

    // clean up the document (gh issues)
    let remove = cpy.querySelectorAll(
      "form#new_comment_form, .gh-header-actions, .Button-label, .dropdown-menu, .discussion-timeline-actions, [data-hide-on-error], [data-show-on-error], dialog, dialog-helper, .thread-subscribe-form"
    )

    remove.forEach((el) => {
      el.remove()
    })

    let serializer = new XMLSerializer()
    let serializedHTML = serializer.serializeToString(cpy)

    const clean = markdown.turndown(serializedHTML)

    return clean
  }

  async function runPrompt(id: string) {
    const prompt = userSettings?.settings?.prompts?.find(
      (prompt) => prompt.id === id
    )

    // find the user's api key for model provider
    const apiKey = userSettings?.settings?.apiKeys?.find(
      (apiKey) => apiKey.provider === prompt?.provider
    )?.key

    if (!apiKey) {
      console.error("No user OpenAI key configured.")
      return
    }

    const input = await documentToMarkdown()

    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    })

    const contextNotes = entity?.notes
      ?.map((note) => `${note.createdAt} ${note.content}`)
      .join("\n")

    const promptInput = `
      ${prompt?.content}
      ---
      ${input}
    `

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "You are a helpful technical assistant.",
      },
      ...(contextNotes
        ? ([
            {
              role: "user",
              content: `Past notes for context: ${contextNotes}`,
            },
          ] as ChatCompletionMessageParam[])
        : []),
      { role: "user", content: promptInput },
    ]

    // console.log(messages)

    setLoadingPromptResponse(true)

    // TODO: try catch with toast
    let chatCompletion

    try {
      chatCompletion = await openai.chat.completions.create({
        messages: messages,
        model: prompt?.model,
        max_tokens: prompt?.maxTokens,
        n: 1,
        stop: null,
        temperature: 0.2,
      })
    } catch (error) {
      console.error(error)
      setLoadingPromptResponse(false)

      return
    }

    let response: string
    try {
      response = chatCompletion.choices[0].message.content
    } catch (error) {
      console.error(error)
      setLoadingPromptResponse(false)
      return
    }

    const modelRef = `_Model: ${prompt?.model} | Provider: ${prompt?.provider} | Max Tokens: ${prompt?.maxTokens}_`

    response = `${response}\n\n${modelRef}
    `
    setPromptResponseContent(response)
    setLoadingPromptResponse(false)
  }

  const createNote = async () => {
    if (!promptResponseContent.trim()) return
    // if (limitReached(counts, limits, "notes")) return

    setLoadingNote(true)

    await sendToBackground({
      name: "notes" as never,
      body: {
        type: "POST",
        ...(!entity?.exists && { title: entity?.title }),
        content: promptResponseContent.trim(),
      },
    })

    setLoadingNote(false)
    setPromptResponseContent("")
    client.invalidateQueries({ queryKey: ["entity", entity?.url] })
    client.invalidateQueries({ queryKey: ["plan"] })
  }

  useEffect(() => {
    // if the url is for issue or discussion
    if (
      entity?.url.includes("/issues/") ||
      entity?.url.includes("/discussions/")
    ) {
      setIsIssueOrDiscussion(true)
    }
  }, [entity])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [promptResponseContent])

  useEffect(() => {
    if (settings) {
      setUserSettings(
        settings.find((setting) => setting.userId === user.attrs.id)
      )
    }
  }, [settings])

  return (
    <>
      {isIssueOrDiscussion &&
        userSettings?.settings?.useUserApiKey &&
        userSettings?.settings?.apiKeys?.length > 0 &&
        userSettings?.settings?.prompts?.length > 0 && (
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  disabled={loadingPromptResponse}
                  variant="secondary">
                  {loadingPromptResponse && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  {!loadingPromptResponse && (
                    <Icons.wand className="mr-2 h-4 w-4" />
                  )}
                  <span className="text-xs">Prompts</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {userSettings?.settings?.prompts?.map((prompt) => (
                  <DropdownMenuItem
                    key={prompt.id}
                    onClick={() => runPrompt(prompt?.id)}>
                    {prompt.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

      {promptResponseContent && (
        <Card className="shadow-sm">
          <h4 className="px-3 py-2">Summary</h4>

          <div className="px-3 ">
            <Textarea
              id="note"
              ref={textareaRef}
              value={promptResponseContent}
              onChange={(e) => setPromptResponseContent(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-1.5 p-3">
            <Button
              variant="ghost"
              onClick={() => setPromptResponseContent("")}>
              Cancel
            </Button>
            <Button onClick={createNote}>
              {loadingNote && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </div>
        </Card>
      )}
    </>
  )
}

export default Prompts
