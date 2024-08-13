import { Intent } from '@conform-to/react'
import { conformZodMessage } from '@conform-to/zod'
import { RefinementCtx, z, ZodSchema } from 'zod'


export function createConformSchema<ServerValidationNames extends string>(
  defineSchema: (server: Refinements<string extends ServerValidationNames ? never : ServerValidationNames>) => ZodSchema
) {
  const schemaCreator = (predicates?: Predicates<ServerValidationNames>) => (intent: Intent | null) => {
    const refinements =
      predicates
      ? mapObject(predicates, predicateToRefinement(intent))
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

const predicateToRefinement = (intent: Intent | null) => (predicate: Predicate) => (message: string) =>
  z.unknown().superRefine(
    async (input: any, ctx: RefinementCtx) => {
      if ( intent?.type == 'validate' &&
           intent.payload.name !== ctx.path[0] )
        return ctx.addIssue({
          code: 'custom',
          message: conformZodMessage.VALIDATION_SKIPPED
        })
      
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

// Every key returns the redirectToServer refinement
const redirectToServerProxy = <Keys extends string>(): Record<Keys, Refinement> =>
  new Proxy(
    {} as Record<Keys, Refinement>,
    { get: () => redirectToServer })

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
