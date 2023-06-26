import { createContext, useContext } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import { useQuery } from "@tanstack/react-query"

import { useAuth } from "./user"

type ActivityItem = {
  id: string
  createdAt: string
  entity: {
    title: string
    url?: string
  }
}

type Status = {
  status: "loading" | "error" | "success"
}

type UserActivity = {
  activity: ActivityItem[]
} & Status

type UserActivityContextType = UserActivity | null

const UserActivityContext = createContext<UserActivityContextType | undefined>(
  undefined
)

export const useUserActivity = () => {
  return useContext(UserActivityContext)
}

const getUserActivity = async () => {
  try {
    let { data, status } = await sendToBackground({
      name: "activities" as never,
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

export function UserActivityProvider({ children }) {
  const user = useAuth()

  const { data, status } = useQuery({
    staleTime: 3 * 1000,
    enabled: !!user?.isAuthed,
    queryKey: ["activity"],
    queryFn: getUserActivity,
  })

  return (
    <UserActivityContext.Provider value={{ activity: data, status }}>
      {children}
    </UserActivityContext.Provider>
  )
}
