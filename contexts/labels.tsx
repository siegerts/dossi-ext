import { createContext, useContext } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import { useQuery } from "@tanstack/react-query"

type Label = {
  id: string
  name: string
  description: string
  color: string
  userId: string
  createdAt: string
  updatedAt: string
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

export function UserLabelsProvider({ children }) {
  const { data, status } = useQuery({
    queryKey: ["labels"],
    queryFn: async () => {
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
  })

  return (
    <LabelsContext.Provider value={{ labels: data, status }}>
      {children}
    </LabelsContext.Provider>
  )
}
