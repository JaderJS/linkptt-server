import z from 'zod'

const schema = z.object({
    PORT: z.coerce.number(),
    URL: z.string(),
    SECRET_KEY: z.string(),
    URL_MINIO: z.string(),
    ACCESS_KEY_MINIO: z.string(),
    SECRET_KEY_MINIO: z.string()
})

const config = schema.parse(process.env)

export { config }