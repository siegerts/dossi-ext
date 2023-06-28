import * as z from "zod"

import { entityUrlSchema } from "./entity"

export const noteCreateSchema = z.object({
  content: z.string(),
  title: z.string().optional(),
  url: entityUrlSchema,
})

export const notePatchSchema = z.object({
  content: z.string(),
})
