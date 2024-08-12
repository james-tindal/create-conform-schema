import { conformZodMessage } from '@conform-to/zod';
import { RefinementCtx, z } from 'zod';
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
				if (! server)
					return validateOnServer(ctx)

				const isUsernameUnique = server.isUsernameUnique(username)
				return addIssueOnFail(isUsernameUnique, 'Username is already used', ctx)
			}),
		),
	password: z.string({ required_error: 'Password is required' })
}))

const addIssueOnFail = async (asyncTruthy: any | Promise<any>, message: string, ctx: RefinementCtx) => {
	const truthy = await asyncTruthy
	if (! truthy)
		ctx.addIssue({
			code: 'custom',
			message: message,
		})
}

const validateOnServer = (ctx: RefinementCtx) => ctx.addIssue({
	code: 'custom',
	message: conformZodMessage.VALIDATION_UNDEFINED,
	fatal: true,
})
