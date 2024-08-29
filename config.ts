import z from 'zod'

const schema = z.object({
    PORT: z.coerce.number(),
    URL: z.string(),
    SECRET_KEY: z.string()
})

const config = schema.parse(process.env)

export { config }