import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
// import type { Prompt, ApiKey } from "~types/prompt"
import { v4 as uuidv4 } from "uuid"
import type { User, UserSettings } from "~types/user"

// user
const storage = new Storage()

// settings
const settingsStorage = new Storage({
  area: "local",
})

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // get user from sync storage
  const user = await storage.get<User>("user")

  if (!user?.isAuthed) {
    return res.send({
      status: { ok: false, error: "user not logged in" },
    })
  }

  // get user settings from storage
  let userSettings =
    (await settingsStorage.get<UserSettings[]>("settings")) || []

  // find the user settings object for the current user
  let currentUserSettings = userSettings.find(
    (settings) => settings.userId === user.attrs.id
  )

  // initialize if not found
  if (!currentUserSettings) {
    currentUserSettings = {
      id: uuidv4(),
      userId: user.attrs.id,
      settings: {
        useUserApiKey: true,
        apiKey: null,
        prompts: [],
      },
    }

    await settingsStorage.set("settings", [
      ...userSettings,
      currentUserSettings,
    ])

    userSettings = await settingsStorage.get<UserSettings[]>("settings")
  }

  switch (req?.body?.type) {
    // USE USER API KEY
    case "SET_USE_USER_API_KEY": {
      const { useUserApiKey } = req.body

      currentUserSettings.settings.useUserApiKey = useUserApiKey

      userSettings = userSettings.map((settings) => {
        if (settings.userId === user.attrs.id) {
          return currentUserSettings
        }

        return settings
      })

      await settingsStorage.set("settings", userSettings)

      return res.send({ status: { ok: true } })
    }

    // API KEY
    case "SET_API_KEY": {
      const { apiKey } = req.body

      currentUserSettings.settings.apiKey = {
        id: uuidv4(),
        key: apiKey,
        updatedAt: new Date().getTime(),
      }

      userSettings = userSettings.map((settings) => {
        if (settings.userId === user.attrs.id) {
          return currentUserSettings
        }

        return settings
      })

      await settingsStorage.set("settings", userSettings)

      return res.send({ status: { ok: true } })
    }

    case "DELETE_API_KEY": {
      currentUserSettings.settings.apiKey = null

      userSettings = userSettings.map((settings) => {
        if (settings.userId === user.attrs.id) {
          return currentUserSettings
        }

        return settings
      })

      await settingsStorage.set("settings", userSettings)

      return res.send({ status: { ok: true } })
    }

    // PROMPTS
    case "ADD_PROMPT": {
      const { title, content, model, provider, maxTokens } = req.body

      const prompt = {
        id: uuidv4(),
        title,
        content,
        model,
        maxTokens,
        provider,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      }

      // add prompt to the user settings object
      currentUserSettings.settings.prompts.push(prompt)

      userSettings = userSettings.map((settings) => {
        if (settings.userId === user.attrs.id) {
          return currentUserSettings
        }

        return settings
      })

      await settingsStorage.set("settings", userSettings)

      return res.send({ status: { ok: true } })
    }

    case "GET_PROMPTS": {
      return res.send({
        data: currentUserSettings?.settings?.prompts,
        status: { ok: true },
      })
    }

    case "DELETE_PROMPT": {
      const { id } = req.body

      // remove prompt from the user settings object
      currentUserSettings.settings.prompts =
        currentUserSettings.settings.prompts.filter(
          (prompt) => prompt.id !== id
        )

      userSettings = userSettings.map((settings) => {
        if (settings.userId === user.attrs.id) {
          return currentUserSettings
        }

        return settings
      })

      await settingsStorage.set("settings", userSettings)

      return res.send({ status: { ok: true } })
    }

    case "UPDATE_PROMPT": {
      const { id, title, content, model, maxTokens } = req.body

      // update prompt in the user settings object
      currentUserSettings.settings.prompts =
        currentUserSettings.settings.prompts.map((prompt) => {
          if (prompt.id === id) {
            return {
              ...prompt,
              title,
              content,
              model,
              maxTokens,
              updatedAt: new Date().getTime(),
            }
          }

          return prompt
        })

      userSettings = userSettings.map((settings) => {
        if (settings.userId === user.attrs.id) {
          return currentUserSettings
        }

        return settings
      })

      await settingsStorage.set("settings", userSettings)

      return res.send({ status: { ok: true } })
    }

    case "RESET_SETTINGS": {
      currentUserSettings.settings = {
        useUserApiKey: true,
        apiKey: null,
        prompts: [],
      }

      userSettings = userSettings.map((settings) => {
        if (settings.userId === user.attrs.id) {
          return currentUserSettings
        }

        return settings
      })

      await settingsStorage.set("settings", userSettings)

      return res.send({ status: { ok: true } })
    }
  }
}

export default handler
