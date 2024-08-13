import { Intent } from '@conform-to/react'
import { conformZodMessage } from '@conform-to/zod'
import { RefinementCtx, z, ZodSchema } from 'zod'

// # Skipping on intent

// Next:
//   It should do something with the intent
// What?
//   if
//     intent.type == validate
//     &&
//     intent.payload.name !== ctx.path[0]
//   skip

// Where do we do this?
// addIssueOnFail

// need to pass intent into it
// then compare with ctx.path


export function createConformSchema<ServerValidationNames extends string>(
  defineSchema: (server: Refinements<string extends ServerValidationNames ? never : ServerValidationNames>) => ZodSchema
) {
  const schemaCreator = (predicates?: Predicates<ServerValidationNames>) => (intent: Intent | null) => {
    const refinements =
      predicates
      ? mapObject(predicates, predicateToRefinement)
      : redirectToServerProxy<ServerValidationNames>()
    return defineSchema(refinements)
  }

  type PredicateObject = string extends ServerValidationNames
    ? EmptyObject
    : Predicates<ServerValidationNames>

  return {
    server: schemaCreator as (predicates: PredicateObject) => (intent: Intent | null) => ZodSchema,
    client: schemaCreator()
  }
}

const predicateToRefinement = (predicate: Predicate) => (message: string) =>
  z.unknown().superRefine(
    async (input: any, ctx: RefinementCtx) => {
      console.log(ctx.path)
      const truthy = await predicate(input)
      if (! truthy)
        ctx.addIssue({
          code: 'custom',
          message: message,
        })
    })

const redirectToServer = (message: string) =>
  z.unknown().superRefine(
    (input: any, ctx: RefinementCtx) => ctx.addIssue({
      code: 'custom',
      message: conformZodMessage.VALIDATION_UNDEFINED,
      fatal: true,
    })
  )

// Every key returns the validateOnServer refinement
const redirectToServerProxy = <Keys extends string>(): Record<Keys, Refinement> =>
  new Proxy(
    {} as Record<Keys, Refinement>,
    { get: () => redirectToServer })


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
