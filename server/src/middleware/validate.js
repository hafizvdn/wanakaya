/**
 * Returns an Express middleware that validates req.body against a Zod schema.
 * On failure, responds 400 with the first validation error message.
 * @param {import('zod').ZodSchema} schema
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const message = result.error.errors[0]?.message ?? 'Validation error'
      return res.status(400).json({ success: false, error: message })
    }
    req.body = result.data
    next()
  }
}
