import { conformZodMessage } from '@conform-to/zod'
import { RefinementCtx, z, ZodSchema } from 'zod'

export type AsyncTruthy = any | Promise<any>

export type Predicate = (input: any) => AsyncTruthy

export type Refinement = (message: string) => ZodSchema

type Predicates<Name extends string> = {
  [key in Name]: Predicate
}

type Refinements<Name extends string> = {
  [key in Name]: Refinement
}

type ServerValidationNames = 'isUsernameUnique'


export function createFormSchema(
  create: (server: Refinements<ServerValidationNames>) => ZodSchema
) {
  const schemaCreator = (server?: Predicates<ServerValidationNames>) =>
    create({
      isUsernameUnique: makeRefinement(server?.isUsernameUnique)
    })

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

export const makeRefinement = (predicate?: Predicate) => (message: string) =>
  z.string().superRefine(makeRefinementFunction(message, predicate))
