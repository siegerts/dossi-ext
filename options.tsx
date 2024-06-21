import { useEffect, useState } from "react"
import { AuthProvider, useAuth } from "@/contexts/user"
import type { ApiKey } from "~types/prompt"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { sendToBackground } from "@plasmohq/messaging"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Toaster } from "@/components/ui/toaster"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { formatDistanceToNow, set } from "date-fns"
import type { UserSettings } from "~types/user"

import "~/contents/base.css"
import cssText from "data-text:~/styles/globals.css"

// Inject into the ShadowDOM
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const availableProviders: string[] = ["openai"]

const models = ["gpt-4o"] as string[]

const promptSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 chars" })
    .max(25, { message: "Title must be less than 25 chars" }),
  content: z
    .string()
    .min(25, { message: "Content must be at least 50 chars" })
    .max(1000, { message: "Content must be less than 1000 chars" }),
  model: z
    .string()
    .nonempty()
    .refine((m) => models.includes(m), {
      message: "Invalid model",
    }),
  maxTokens: z.coerce
    .number()
    .min(50, { message: "Max tokens must be between 50 and 1000" })
    .max(1000, { message: "Max tokens must be between 50 and 1000" }),
})

const Options = () => {
  return (
    <div>
      <AuthProvider>
        <OptionsIndex />
        <Toaster />
      </AuthProvider>
    </div>
  )
}

function OptionsIndex() {
  const user = useAuth()
  const [useUserApiKey, setUseUserApiKey] = useState(false)

  const [settings, setSettings] = useStorage<any[]>({
    key: "settings",
    instance: new Storage({
      area: "local",
    }),
  })

  const [userSettings, setUserSettings] = useState<UserSettings>()

  const [openAIKey, setOpenAIKey] = useState<ApiKey>(null)
  const [openAIKeyValue, setOpenAIKeyValue] = useState("")

  const promptForm = useForm<z.infer<typeof promptSchema>>({
    resolver: zodResolver(promptSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      content: "",
      model: "gpt-4o",
      maxTokens: 100,
    },
  })

  async function onSubmit(values: z.infer<typeof promptSchema>) {
    const res = await sendToBackground({
      name: "settings" as never,
      body: {
        type: "ADD_PROMPT",
        title: values.title,
        content: values.content,
        model: values.model,
        provider: "openai",
        maxTokens: values.maxTokens,
      },
    })

    if (res.status.ok) {
      promptForm.reset()
      toast({
        title: "Prompt added",
        description: "The prompt has been added successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "An error occurred while adding the prompt",
      })
    }
  }

  async function saveUseUserApiKey() {
    setUseUserApiKey(!useUserApiKey)

    await sendToBackground({
      name: "settings" as never,
      body: {
        type: "SET_USE_USER_API_KEY",
        useUserApiKey: !useUserApiKey,
      },
    })
  }

  async function updateApiKey(key: string, provider: string) {
    if (!key || key.trim().length === 0) {
      return
    }

    if (!provider || !availableProviders.includes(provider)) {
      return
    }

    await sendToBackground({
      name: "settings" as never,
      body: {
        type: "SET_API_KEY",
        apiKey: key,
        provider: provider,
      },
    })

    toast({
      title: "API key updated",
      description: `The ${provider} key has been updated`,
    })
  }

  async function removeApiKey(id: string) {
    await sendToBackground({
      name: "settings" as never,
      body: {
        type: "DELETE_API_KEY",
        id,
      },
    })
  }

  async function deletePrompt(id: string) {
    await sendToBackground({
      name: "settings" as never,
      body: {
        type: "DELETE_PROMPT",
        id,
      },
    })
  }

  useEffect(() => {
    if (settings) {
      const currentUserSettings = settings.find(
        (setting) => setting?.userId === user?.attrs?.id
      )
      setUserSettings(currentUserSettings)
    }
  }, [settings, user])

  useEffect(() => {
    if (userSettings) {
      setUseUserApiKey(userSettings?.settings?.useUserApiKey)

      if (userSettings?.settings?.useUserApiKey) {
        const openAIKey = userSettings?.settings?.apiKeys?.find(
          (key) => key.provider === "openai"
        )
        setOpenAIKey(openAIKey)
      }
    }
  }, [userSettings])

  return (
    <>
      {user && user?.isAuthed ? (
        <div className="m-10 w-1/2 text-base">
          <h2 className="mb-4 text-xl font-medium">dossi local settings</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            These settings are stored locally on your device and are not synced
            to any server or any other device.
          </p>

          <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label htmlFor="use-api-key">Bring your own OpenAI key</Label>
              <div className="text-sm text-muted-foreground">
                Use your own OpenAI key to authenticate requests to the OpenAI
                API.
              </div>
            </div>
            <div>
              <Switch
                id="use-api-key"
                checked={useUserApiKey}
                onCheckedChange={saveUseUserApiKey}
              />
            </div>
          </div>

          {userSettings?.settings?.useUserApiKey && (
            <Card className="mt-10">
              <CardHeader>
                <CardTitle>OpenAI configuration</CardTitle>
                <CardDescription>
                  This is your API key that is used to authenticate requests to
                  the OpenAI API.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex w-full items-center space-x-2 ">
                  <Input
                    type="password"
                    placeholder="OpenAPI key"
                    value={openAIKeyValue}
                    onChange={(e) => setOpenAIKeyValue(e.target.value)}
                  />
                  <Button
                    type="submit"
                    onClick={() => {
                      updateApiKey(openAIKeyValue, "openai")
                      setOpenAIKeyValue("")
                    }}>
                    Save
                  </Button>
                  <Button
                    type="button"
                    onClick={() => removeApiKey(openAIKey?.id)}
                    variant="secondary">
                    Clear
                  </Button>
                </div>

                {openAIKey?.updatedAt && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Last updated:{" "}
                          {formatDistanceToNow(openAIKey?.updatedAt)} ago
                        </p>
                      </TooltipTrigger>

                      <TooltipContent>
                        <span className="text-xs">
                          {new Intl.DateTimeFormat(navigator.language, {
                            dateStyle: "long",
                            timeStyle: "short",
                          }).format(new Date(openAIKey?.updatedAt))}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <div className="mt-4 space-y-1">
                  <h4 className="mt-6 text-lg font-semibold">Add prompt</h4>
                  <div className="text-sm text-muted-foreground">
                    Prompts are used to generate responses from the OpenAI API.
                    You can add, edit, and delete prompts here. These will be
                    available in the extension on issues.
                  </div>

                  <Form {...promptForm}>
                    <form
                      onSubmit={promptForm.handleSubmit(onSubmit)}
                      className="space-y-8">
                      <FormField
                        control={promptForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="" {...field} />
                            </FormControl>
                            <FormDescription>
                              A short title for the prompt. Used to identify the
                              prompt in the extension.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={promptForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea placeholder="" {...field} />
                            </FormControl>
                            <FormDescription>
                              The content of the prompt
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={promptForm.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}>
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Model" />
                                </SelectTrigger>
                                <SelectContent>
                                  {models.map((model) => (
                                    <SelectItem key={model} value={model}>
                                      {model}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormDescription>
                              The model to use for generating the response. The
                              API key must have access to the selected model.
                              Changing the API key permissions may take a few
                              minutes to take effect.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={promptForm.control}
                        name="maxTokens"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max tokens</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>
                              The maximum number of tokens to generate
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">Save</Button>
                    </form>
                  </Form>
                </div>

                {/* saved prompts */}

                <div className="mt-6">
                  <h4 className="text-lg font-semibold">Saved prompts</h4>
                  <div className="text-sm text-muted-foreground">
                    These are the prompts that are available to use in the
                    extension.
                  </div>

                  {userSettings?.settings?.prompts?.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No prompts available
                    </p>
                  ) : (
                    <div className="mt-2 w-full items-center">
                      {userSettings?.settings?.prompts?.map((prompt) => (
                        <div
                          className="mb-3 rounded-lg border p-3"
                          key={prompt.id}>
                          <div className="flex w-full flex-col gap-1">
                            <div className="flex items-center">
                              <div className="flex items-center gap-2">
                                <div className="font-semibold">
                                  {prompt.title}
                                </div>
                              </div>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="ml-auto text-xs">
                                    {formatDistanceToNow(
                                      new Date(prompt.createdAt),
                                      {
                                        addSuffix: true,
                                      }
                                    )}
                                  </TooltipTrigger>

                                  <TooltipContent>
                                    <span className="text-xs">
                                      {new Intl.DateTimeFormat(
                                        navigator.language,
                                        {
                                          dateStyle: "long",
                                          timeStyle: "short",
                                        }
                                      ).format(new Date(prompt.createdAt))}
                                    </span>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>

                            <div className="text-xs text-muted-foreground">
                              Model: {prompt.model}
                            </div>

                            <div className="text-xs text-muted-foreground">
                              Max tokens: {prompt.maxTokens}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {prompt.content}
                            </div>
                            <div className="mt-3">
                              <Button
                                onClick={() => deletePrompt(prompt.id)}
                                variant="secondary">
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-7">
            <hr className="mb-5 " />
            <h4 className="text-lg font-semibold">Reset settings</h4>
            <div className="mb-3 text-sm text-muted-foreground">
              Reset all local settings to their default values.
            </div>

            <Button
              variant="secondary"
              onClick={() =>
                sendToBackground({
                  name: "settings" as never,
                  body: {
                    type: "RESET_SETTINGS",
                  },
                })
              }>
              Reset settings
            </Button>
          </div>
        </div>
      ) : (
        <div className="m-10 text-sm text-muted-foreground">
          You need to be logged in to view settings.
        </div>
      )}
    </>
  )
}

export default Options
