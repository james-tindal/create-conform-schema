import { conformZodMessage } from '@conform-to/zod';
import { z } from 'zod';
import { createFormSchema } from './createSchema';

export const { client, server } = createFormSchema(server => z.object({
	username: z
		.string({ required_error: 'Username is required' })
		.regex(
			/^[a-zA-Z0-9]+$/,
			'Invalid username: only letters or numbers are allowed',
		)
		.pipe(
			z.string().superRefine((username, ctx) => {
				if (! server?.isUsernameUnique) {
					ctx.addIssue({
						code: 'custom',
						message: conformZodMessage.VALIDATION_UNDEFINED,
						fatal: true,
					});
					return;
				}
				const isUsernameUnique = server.isUsernameUnique(username)
				if (isUsernameUnique instanceof Promise)
					return isUsernameUnique.then(isUsernameUnique => {
						if (!isUsernameUnique)
							ctx.addIssue({
								code: 'custom',
								message: 'Username is already used',
							})
					})
				else
					return isUsernameUnique
			}),
		),
	password: z.string({ required_error: 'Password is required' })
}))