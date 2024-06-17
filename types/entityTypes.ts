import type { INote } from "./noteTypes"

export type Label = {
  id: string
  name: string
  description: string
}

export type UserLabels = {
  label: Label
}

export type Pin = {
  id: string
}

export type Entity = {
  id: string
  url: string
  exists: boolean
  createdAt: string
  updatedAt: string
  notes: INote[]
  pins: Pin[]
  labels: UserLabels[]
}

export type Status = {
  status: "loading" | "error" | "success"
}

export type Tab = {
  url: string
  title: string
}

export type EntityTab = Tab & Entity & Status
