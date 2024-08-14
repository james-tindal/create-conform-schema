import { z } from 'zod'
import { createConformSchema, Predicates } from '../create-conform-schema'
import { refine } from '../create-conform-refine'

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
		.pipe(z.string().superRefine((a, b) => console.log('hello from refinement', intent)))
		.pipe(refine<string>((username, { skip, validateOnServer, addIssue, path }) => {
			
		}))
		,

	password: z.string({ required_error: 'Password is required' })
}))