import { conformZodMessage } from '@conform-to/zod'
import { RefinementCtx, z, ZodSchema } from 'zod'

// make it collect intent

export function createFormSchema<ServerValidationNames extends string>(
  defineSchema: (server: Refinements<string extends ServerValidationNames ? never : ServerValidationNames>) => ZodSchema
) {
  const schemaCreator = (predicates?: Predicates<ServerValidationNames>) => {
    const refinements =
      predicates
      ? mapObject(predicates, makeRefinement)
      : monoProxy(makeRefinement())<ServerValidationNames>()
    return defineSchema(refinements)
  }

  type PredicateObject = string extends ServerValidationNames
    ? EmptyObject
    : Predicates<ServerValidationNames>

  return {
    server: schemaCreator as (predicates: PredicateObject) => ZodSchema,
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


// Map all values to another type. Keys not modified.
function mapObject<Key extends string | number | symbol, In, Out>(
  object: Record<Key, In>,
  mapFn: (value: In) => Out
): Record<Key, Out> {
  const entries = Object.entries(object).map(([k, v]) =>
    [k, mapFn(v as In)]
  )
  return Object.fromEntries(entries)
}

// Proxy that returns the same value for every key
const monoProxy = <Value>(value: Value) => <Keys extends string>(): Record<Keys, Value> =>
  new Proxy(
    {} as Record<Keys, Value>,
    { get: () => value })

type AsyncTruthy = any | Promise<any>

type Predicate = (input: any) => AsyncTruthy

type Refinement = (message: string) => ZodSchema

type Predicates<Name extends string> = {
  [key in Name]: Predicate
}

type Refinements<Name extends string> = {
  [key in Name]: Refinement
}

const symbol = Symbol()
type EmptyObject = { [symbol]?: never }
