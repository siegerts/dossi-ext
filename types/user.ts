import type { Prompt, ApiKey } from "~types/prompt"

export type User = {
  isAuthed: boolean
  attrs: {
    name: string
    email: string
    image: string
    id: string
  }
}

export type UserSettings = {
  id: string
  userId: string
  settings: {
    useUserApiKey: boolean
    apiKeys: ApiKey[]
    prompts: Prompt[]
  }
}
