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
  defineSchema: (server: Refinements<ServerValidationNames>) => ZodSchema
) {
  const schemaCreator = (predicates?: Predicates<ServerValidationNames>) =>{
    const refinements =
      predicates
      ? mapObject(predicates, makeRefinement)
      : monoProxy(makeRefinement())<ServerValidationNames>()
    return defineSchema(refinements)
  }

  return {
    server: schemaCreator,
    client: schemaCreator()
  }
}

const addIssueOnFail = (message: string, predicate: Predicate) => async (input: any, ctx: RefinementCtx) => {
	const truthy = await predicate(input)
	if (! truthy)
		ctx.addIssue({
			code: 'custom',
			message: message,
		})
}

const validateOnServer = (input: any, ctx: RefinementCtx) => ctx.addIssue({
	code: 'custom',
	message: conformZodMessage.VALIDATION_UNDEFINED,
	fatal: true,
})

const makeRefinement = (predicate?: Predicate) => (message: string) =>
  z.unknown().superRefine(
    predicate ? addIssueOnFail(message, predicate) : validateOnServer)


// # Skipping

// Now how to add skips to this model?
// Every server validation checks the intent and skips if irrelevant

// I could also add helpers to the "define" function
// arg is "context"
// ctx.intent
// ctx.skip -> function to skip this validation
// ctx.skip -> object of supplied skip functions.  Not at all sure this has any value


const mapObject = <Object extends object, Out>(object: Object, mapFn: (value: Object[keyof Object]) => Out) => {
  const entries = Object.entries(object).map(([k, v]) =>
    [k, mapFn(v)]
  )
  return Object.fromEntries(entries) as unknown as {
    [key in keyof Object]: Out
  }
}

// Proxy that returns the same value for every key
const monoProxy = <Value>(value: Value) => <Keys extends string>(): Record<Keys, Value> =>
  new Proxy(
    {} as Record<Keys, Value>,
    { get: () => value })
