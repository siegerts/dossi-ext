import * as z from "zod"

import { entityUrlSchema } from "./entity"

export const noteCreateSchema = z.object({
  content: z.string().trim(),
  title: z.string().trim().optional(),
  url: entityUrlSchema,
})

export const notePatchSchema = z.object({
  content: z.string(),
})
