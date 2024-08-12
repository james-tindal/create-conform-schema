import { ZodSchema } from 'zod'


interface Server {
  isUsernameUnique: (message: string) => boolean | Promise<boolean>
}

export function createFormSchema(
  create: (server?: Server) => ZodSchema
) {
  const schemaCreator = (server?: Server) =>
    create(server)

  return {
    server: schemaCreator,
    client: schemaCreator()
  }
}
