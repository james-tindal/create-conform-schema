import { z } from 'zod';
import { createFormSchema } from './createSchema';

export const { client, server } = createFormSchema(server => z.object({
	username: z
		.string({ required_error: 'Username is required' })
		.regex(
			/^[a-zA-Z0-9]+$/,
			'Invalid username: only letters or numbers are allowed',
		)
		.pipe(server.isUsernameUnique('Username is already used')),

	password: z.string({ required_error: 'Password is required' })
}))
