import type { Intent } from '@conform-to/react';
import { conformZodMessage } from '@conform-to/zod';
import { z } from 'zod';

export function createSignupSchema(
	intent: Intent | null,
	options?: {
		// isUsernameUnique is only defined on the server
		isUsernameUnique: (username: string) => Promise<boolean>;
	},
) {
	return z.object({
		username: z
			.string({ required_error: 'Username is required' })
			.regex(
				/^[a-zA-Z0-9]+$/,
				'Invalid username: only letters or numbers are allowed',
			)
			.pipe(
				z.string().superRefine((username, ctx) => {
					const isValidatingUsername =
						intent === null ||
						(intent.type === 'validate' &&
							intent.payload.name === 'username');

					if (!isValidatingUsername) {
						ctx.addIssue({
							code: 'custom',
							message: conformZodMessage.VALIDATION_SKIPPED,
						});
						return;
					}

					if (typeof options?.isUsernameUnique !== 'function') {
						ctx.addIssue({
							code: 'custom',
							message: conformZodMessage.VALIDATION_UNDEFINED,
							fatal: true,
						});
						return;
					}

					return options.isUsernameUnique(username).then((isUnique) => {
						if (!isUnique) {
							ctx.addIssue({
								code: 'custom',
								message: 'Username is already used',
							});
						}
					});
				}),
			),
		password: z.string({ required_error: 'Password is required' }),
	})
}
