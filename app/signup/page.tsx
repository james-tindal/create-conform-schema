'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signup } from '@/app/signup/action';
import {
	useForm,
	getFormProps,
	getInputProps,
} from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { client } from './schema';

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const { pending } = useFormStatus();

	return <button {...props} disabled={pending || props.disabled} />;
}

export default function SignupForm() {
	const [lastResult, action] = useFormState(signup, undefined);
	const [form, fields] = useForm({
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: client });
		},
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
	});

	return (
		<form action={action} {...getFormProps(form)}>
			<label>
				<div>Username</div>
				<input
					className={!fields.username.valid ? 'error' : ''}
					{...getInputProps(fields.username, { type: 'text' })}
					key={fields.username.key}
				/>
				<div>{fields.username.errors}</div>
			</label>
			<label>
				<div>Password</div>
				<input
					className={!fields.password.valid ? 'error' : ''}
					{...getInputProps(fields.password, { type: 'password' })}
					key={fields.password.key}
				/>
				<div>{fields.password.errors}</div>
			</label>
			<hr />
			<Button>Signup</Button>
		</form>
	);
}
