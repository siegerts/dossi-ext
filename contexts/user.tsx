import { createContext, useContext, useEffect, useState } from "react"
import { sendToBackground } from "@plasmohq/messaging"

type CurrentUserStatus = "loading" | "error" | "success"

type User = {
  isAuthed: boolean
  status: CurrentUserStatus
  attrs: {
    name: string
    email: string
    image: string
    id: string
    plan?: string
    role?: string
  }
}

type UserContextType = User | null

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useAuth = () => {
  return useContext(UserContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState<User>(null)
  const [currentUserStatus, setCurrentUserStatus] =
    useState<CurrentUserStatus>(null)

  useEffect(() => {
    const checkUser = async () => {
      setCurrentUserStatus("loading")

      const { user, status } = await sendToBackground({
        name: "user" as never,
      })

      if (status.ok && user.isAuthed) {
        setCurrentUser(user)
        setCurrentUserStatus("success")
      } else {
        setCurrentUser(null)
        setCurrentUserStatus("error")
      }
    }

    const visibilityChangeHandler = () => {
      if (document.visibilityState === "visible" || document.hasFocus()) {
        checkUser()
      }
    }

    document.addEventListener("visibilitychange", visibilityChangeHandler)

    checkUser()

    return () => {
      document.removeEventListener("visibilitychange", visibilityChangeHandler)
    }
  }, [])

  return (
    <UserContext.Provider value={{ status: currentUserStatus, ...currentUser }}>
      {children}
    </UserContext.Provider>
  )
}
