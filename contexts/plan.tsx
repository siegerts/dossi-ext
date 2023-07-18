import { createContext, useContext } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import { useQuery } from "@tanstack/react-query"

import { useAuth } from "./user"

interface Counts {
  notes: number
  labels: number
  pins: number
}

interface Limits {
  notes: number
  labels: number
  pins: number
}

interface PlanData {
  plan: string
  counts: Counts
  limits?: Limits
  status: "loading" | "error" | "success"
}

type PlanDataContextType = PlanData | null

const PlanDataContext = createContext<PlanDataContextType | undefined>(
  undefined
)

export const usePlanData = () => {
  return useContext(PlanDataContext)
}

const getUserPlanData = async () => {
  try {
    let { data, status } = await sendToBackground({
      name: "plan" as never,
      body: {
        type: "GET",
      },
    })

    if (status.ok) {
      return data
    }

    throw Error(status.error)
  } catch (err) {
    console.error(err)
  }
}

export function PlanDataProvider({ children }) {
  const user = useAuth()

  // this will only run if user is authed
  // this is here to prevent the query from firing
  // before the user is logged in or
  // if the user logs out
  // if caches the labels
  const { data, status } = useQuery({
    staleTime: 3 * 1000,
    enabled: !!user?.isAuthed,
    queryKey: ["plan"],
    queryFn: getUserPlanData,
  })

  return (
    <PlanDataContext.Provider value={{ ...data, status }}>
      {children}
    </PlanDataContext.Provider>
  )
}
