import { conformZodMessage } from '@conform-to/zod'
import { RefinementCtx, z, ZodSchema } from 'zod'

export type AsyncTruthy = any | Promise<any>

export type Predicate = (input: any) => AsyncTruthy

export type Refinement = (message: string) => ZodSchema

interface Server {
  isUsernameUnique: Predicate
}


export function createFormSchema(
  create: (server?: Server) => ZodSchema
) {
  const schemaCreator = (server?: Server) =>
    create(server)

  return {
    server: schemaCreator,
    client: schemaCreator()
  }
}

const addIssueOnFail = async (asyncTruthy: AsyncTruthy, message: string, ctx: RefinementCtx) => {
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

const makeRefinementFunction = (message: string, predicate?: Predicate) => (input: any, ctx: RefinementCtx) => {
	if (! predicate)
		return validateOnServer(ctx)

	const asyncTruthy = predicate(input)
	return addIssueOnFail(asyncTruthy, message, ctx)
}

export const makeRefinement = (message: string, predicate?: Predicate) =>
  z.string().superRefine(makeRefinementFunction(message, predicate))
