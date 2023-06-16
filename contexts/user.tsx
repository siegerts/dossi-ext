import { createContext, useContext, useEffect } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

type User = {
  isAuthed: boolean
  attrs: {
    name: string
    email: string
    image: string
    id: string
    plan?: string
  }
}

type UserContextType = {
  user: User | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useAuth = () => {
  return useContext(UserContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useStorage<User>("user")

  useEffect(() => {
    const checkUser = async () => {
      const { user, status } = await sendToBackground({
        name: "user" as never
      })

      setUser(user?.user)
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        checkUser()
      }
    })

    checkUser()
  }, [])

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  )
}
