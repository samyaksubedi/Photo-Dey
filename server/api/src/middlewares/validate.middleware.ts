import type { RequestHandler } from 'express';
import { type ZodType } from 'zod';
import { ApiError } from '../utils/api-output.util.js';

type ValidateInput = {
  schema: ZodType;
  source?: 'body' | 'params' | 'query';
};
const validate = ({
  schema,
  source = 'body',
}: ValidateInput): RequestHandler => {
  return async (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json(
        new ApiError(
          400,
          `Error validating req.${source}`,
          result.error.issues.map((e) => {
            return {
              path: e.path,
              message: e.message,
            };
          }),
        ),
      );
    }
    req[source] = result.data;
    next();
  };
};

export { validate };
