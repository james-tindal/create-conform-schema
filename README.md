
# create-conform-schema

An abstraction to make using [conform](https://github.com/edmundhung/conform) easier.

There is a runnable next.js example in the "example" folder.

## Server-side validations

``` typescript
import { z } from 'zod'
import { createConformSchema, Predicates } from 'create-conform-schema'

type ServerValidationNames = 'isUsernameUnique'
export type ServerValidations = Predicates<ServerValidationNames>
export const { client, server } = createConformSchema<ServerValidationNames>(({ server }) => z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .regex(/^[a-zA-Z0-9]+$/, 'Invalid username: only letters or numbers are allowed')
    .pipe(server.isUsernameUnique('Username is already used')),

  password: z.string({ required_error: 'Password is required' })
}))


// Client-side
const submission = parseWithZod(formData, {
  schema: client
})


// Server-side
const serverValidations: ServerValidations = {
  isUsernameUnique: async (username: string) =>
    !! await db.user.findUnique({ where: { username }, select: null })
}
const submission = await parseWithZod(formData, {
  schema: server(serverValidations),
  async: true,
})
```


## Manual refinement helper

``` typescript
import { z } from 'zod'
import { createConformSchema, refine } from 'create-conform-schema'

export const { client: schema } = createConformSchema(({ intent }) => z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .regex(/^[a-zA-Z0-9]+$/, 'Invalid username: only letters or numbers are allowed')
    .pipe(refine<string>((username, { skip, validateOnServer, addIssue, path }) => {
      if ( intent?.type == 'validate' &&
           intent.payload.name !== path[0] )
        return skip()

      if (!'Something?')
        return validateOnServer()

      if (username == 'jimmy')
        addIssue('jimmy is a bad username') // Creates an issue with code: 'custom'

      if (username.length < 3)
        addIssue({
          code: 'too_small',
          minimum: 3,
          inclusive: true,
          type: 'string'
        })
    })),

  password: z.string({ required_error: 'Password is required' })
}))
```
