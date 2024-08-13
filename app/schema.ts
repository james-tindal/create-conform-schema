import { z } from 'zod';
import { createFormSchema, makeRefinement } from './createSchema';

export const { client, server } = createFormSchema(server => z.object({
	username: z
		.string({ required_error: 'Username is required' })
		.regex(
			/^[a-zA-Z0-9]+$/,
			'Invalid username: only letters or numbers are allowed',
		)
		.pipe(
			makeRefinement('Username is already used', server?.isUsernameUnique),
		),
	password: z.string({ required_error: 'Password is required' })
}))
