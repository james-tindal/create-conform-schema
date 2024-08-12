'use server';

import { redirect } from 'next/navigation';
import { parseWithZod } from '@conform-to/zod';
import { todosSchema, loginSchema, createSignupSchema } from '@/app/schema';

export async function login(prevState: unknown, formData: FormData) {
	const submission = parseWithZod(formData, {
		schema: loginSchema,
	});

	if (submission.status !== 'success') {
		return submission.reply();
	}

	redirect(`/?value=${JSON.stringify(submission.value)}`);
}

export async function createTodos(prevState: unknown, formData: FormData) {
	const submission = parseWithZod(formData, {
		schema: todosSchema,
	});

	if (submission.status !== 'success') {
		return submission.reply();
	}

	redirect(`/?value=${JSON.stringify(submission.value)}`);
}

export async function signup(prevState: unknown, formData: FormData) {
	const submission = await parseWithZod(formData, {
		schema: (control) =>
			// create a zod schema base on the control
			createSignupSchema(control, {
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
