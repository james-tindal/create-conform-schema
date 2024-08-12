'use server';

import { redirect } from 'next/navigation';
import { parseWithZod } from '@conform-to/zod';
import { server } from './schema';

export async function signup(prevState: unknown, formData: FormData) {
	const submission = await parseWithZod(formData, {
		schema: server({
			isUsernameUnique(username) {
				return new Promise((resolve) => {
					setTimeout(() => {
						resolve(username !== 'admin');
					}, Math.random() * 300);
				});
			},
		}),
		async: true,
	});

	if (submission.status !== 'success') {
		return submission.reply();
	}

	redirect(`/?value=${JSON.stringify(submission.value)}`);
}
