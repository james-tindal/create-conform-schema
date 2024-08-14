import { z } from 'zod'
import { createConformSchema, Predicates, refine } from 'create-conform-schema'

type ServerValidationNames = 'isUsernameUnique'
export type ServerValidations = Predicates<ServerValidationNames>
export const { client, server } = createConformSchema<ServerValidationNames>(({ server, intent }) => z.object({
	username: z
		.string({ required_error: 'Username is required' })
		.regex(
			/^[a-zA-Z0-9]+$/,
			'Invalid username: only letters or numbers are allowed',
		)
		.pipe(server.isUsernameUnique('Username is already used'))
		.pipe(refine<string>((username, { skip, validateOnServer, addIssue, path }) => {
      if ( intent?.type == 'validate' &&
           intent.payload.name !== path[0] )
        return skip()

      if (!'Something?')
        return validateOnServer()

      if (username == 'jimmy')
        addIssue('jimmy is a bad username')

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
