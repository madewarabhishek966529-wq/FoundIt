import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const dataToValidate = {};
    if (schema.body) dataToValidate.body = req.body;
    if (schema.query) dataToValidate.query = req.query;
    if (schema.params) dataToValidate.params = req.params;

    // If schema is a direct Zod schema (for body), or an object with body/query/params
    if (schema._def) {
      req.body = schema.parse(req.body);
    } else {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.query) req.query = schema.query.parse(req.query);
      if (schema.params) req.params = schema.params.parse(req.params);
    }
    next();
  } catch (error) {
    if (error.errors) {
      const details = error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message
      }));
      return next(ApiError.unprocessable('Validation failed', details, 'VALIDATION_ERROR'));
    }
    next(error);
  }
};
