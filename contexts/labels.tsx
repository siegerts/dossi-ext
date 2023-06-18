import { createContext, useContext } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "./user"

type Label = {
  id: string
  name: string
  description: string
  color: string
}

type Status = {
  status: "loading" | "error" | "success"
}

type UserLabels = {
  labels: Label[]
} & Status

type LabelsContextType = UserLabels | null

const LabelsContext = createContext<LabelsContextType | undefined>(undefined)

export const useUserLabels = () => {
  return useContext(LabelsContext)
}

const getUserLabels = async () => {
  try {
    let { data, status } = await sendToBackground({
      name: "labels" as never,
      body: {
        type: "GET"
      }
    })

    if (status.ok) {
      return data
    }

    throw Error(status.error)
  } catch (err) {
    console.error(err)
  }
}

export function UserLabelsProvider({ children }) {
  const { user } = useAuth()

  // this will only run if user is authed
  // this is here to prevent the query from firing
  // before the user is logged in or
  // if the user logs out
  const { data, status } = useQuery({
    enabled: !!user?.isAuthed,
    queryKey: ["labels"],
    queryFn: getUserLabels
  })

  return (
    <LabelsContext.Provider value={{ labels: data, status }}>
      {children}
    </LabelsContext.Provider>
  )
}
