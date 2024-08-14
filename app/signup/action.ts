'use server'

import { redirect } from 'next/navigation'
import { parseWithZod } from '@conform-to/zod'
import { server, ServerValidations } from './schema'

export async function signup(prevState: unknown, formData: FormData) {
	const submission = await parseWithZod(formData, {
		schema: server(serverValidations),
		async: true,
	})

	if (submission.status !== 'success') {
		return submission.reply()
	}

	redirect(`/?value=${JSON.stringify(submission.value)}`)
}

const serverValidations: ServerValidations = {
	isUsernameUnique(username) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(username !== 'admin')
			}, Math.random() * 300)
		})
	},
}
