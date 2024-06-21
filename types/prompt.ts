export type Prompt = {
  id: string
  title: string
  content: string
  model: string
  maxTokens: number
  provider: "openai"
  createdAt: number
  updatedAt: number
}

export type ApiKey = {
  id: string
  key: string
  provider: "openai"
  updatedAt: number
}
