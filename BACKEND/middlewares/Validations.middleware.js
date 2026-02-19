export const validate = (schema, type = "body") => (req, res, next) => {
  try {
    const parsed = schema.parse(req[type]);
    req.validated = req.validated || {};
    req.validated[type] = parsed;
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues,
    });
  }
};
