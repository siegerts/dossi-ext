import { createContext, useContext } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import { useQuery } from "@tanstack/react-query"

import { useAuth } from "./user"

type PinItem = {
  id: string
  url: string
  createdAt: string
}

type Status = {
  status: "loading" | "error" | "success"
}

type UserPins = {
  pins: PinItem[]
} & Status

type UserPinsContextType = UserPins | null

const UserPinsContext = createContext<UserPinsContextType | undefined>(
  undefined
)

export const useUserPins = () => {
  return useContext(UserPinsContext)
}

const getUserPins = async () => {
  try {
    let { data, status } = await sendToBackground({
      name: "pins" as never,
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

export function UserPinsProvider({ children }) {
  const user = useAuth()

  const { data, status } = useQuery({
    staleTime: 3 * 1000,
    enabled: !!user?.isAuthed,
    queryKey: ["pins"],
    queryFn: getUserPins,
  })

  return (
    <UserPinsContext.Provider value={{ pins: data, status }}>
      {children}
    </UserPinsContext.Provider>
  )
}
