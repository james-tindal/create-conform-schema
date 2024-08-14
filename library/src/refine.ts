import { conformZodMessage } from '@conform-to/zod'
import { z } from 'zod'


interface RefineContext {
  skip: () => void
  validateOnServer: () => void
  path: z.RefinementCtx['path']
  addIssue(message: string): void
  addIssue(issueData: z.IssueData): void
}

export const refine = <Input>(refinement: (input: Input, ctx: RefineContext) => void) =>
  z.unknown().superRefine((input, ctx) =>
    refinement(input as Input, {
      path: ctx.path,
      addIssue(a) {
        if (typeof a == 'string')
          return ctx.addIssue({
            code: 'custom',
            message: a
          })
        const issueData = a
        ctx.addIssue({
          code: 'custom' as const,
          ...issueData
        })
      },
      skip: () =>
        ctx.addIssue({
          code: 'custom',
          message: conformZodMessage.VALIDATION_SKIPPED
        }),
      validateOnServer: () =>
        ctx.addIssue({
          code: 'custom',
          message: conformZodMessage.VALIDATION_UNDEFINED,
          fatal: true
        })
    })
  )
