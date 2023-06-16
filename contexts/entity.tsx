import { createContext, useContext, useEffect, useState } from "react"
import { sendToBackground } from "@plasmohq/messaging"

// When you call useQuery, we call useQueryClient under the hood.
// This will look up the nearest client in React Context.
import { useQuery } from "@tanstack/react-query"

type Note = {
  id: string
  content: string
  createdAt: string
  updatedAt: string
}

type Label = {
  id: string
  name: string
  color: string
  description: string
}

type UserLabels = {
  label: Label
}

type Pin = {
  id: string
}

type Entity = {
  id: string
  createdAt: string
  updatedAt: string
  notes: Note[]
  pins: Pin[]
  labels: UserLabels[]
}

type Status = {
  status: "loading" | "error" | "success"
}

type Tab = {
  url: string
  title: string
}

type EntityTab = Tab & Entity & Status

const EntityContext = createContext<EntityTab | null>(null)

export const useEntity = () => {
  return useContext(EntityContext)
}

export function EntityProvider({ children }) {
  const [tab, setTab] = useState<Tab | null>(null)

  useEffect(() => {
    const checkTab = async () => {
      const { url, title } = await sendToBackground({
        name: "tab" as never
      })
      console.log(url, title)
      setTab({ url, title })
    }

    const handleRequest = async (req: any) => {
      if (req.type === "URL_CHANGE") {
        checkTab()
      }
    }

    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      handleRequest(request).then((response) => sendResponse(response))
      return true
    })
  }, [])

  const { data, status } = useQuery({
    enabled: !!tab?.url,
    queryKey: ["entity", tab?.url],
    queryFn: async () => {
      try {
        let { data, status } = await sendToBackground({
          name: "entities" as never,
          body: {
            type: "GET_ENTITY_BY_URL",
            url: tab.url
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
    <EntityContext.Provider value={{ ...tab, ...data, status }}>
      {children}
    </EntityContext.Provider>
  )
}
