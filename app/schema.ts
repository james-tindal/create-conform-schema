import { z } from 'zod';
import { createConformSchema } from './create-conform-schema';

type ServerValidationNames = 'isUsernameUnique'
export const { client, server } = createConformSchema<ServerValidationNames>(server => z.object({
	username: z
		.string({ required_error: 'Username is required' })
		.regex(
			/^[a-zA-Z0-9]+$/,
			'Invalid username: only letters or numbers are allowed',
		)
		.pipe(server.isUsernameUnique('Username is already used'))
		// .pipe(refine<Input>((username, { skip, validateOnServer, addIssue, path }) => {
			
		// }))
		,

	password: z.string({ required_error: 'Password is required' })
}))
