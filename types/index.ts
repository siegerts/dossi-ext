export type UrlMatch = {
  url: string
  pos: number
} | null

export type Redirect = {
  to: string
  from: string
}

export type Action = {
  id: string
  createdAt: string
  entity: {
    url: string
    title: string | null
  }
}

export type ActionsByURLAndDate = {
  [key: string]: {
    actions: Action[]
    mostRecent: string
  }
}
