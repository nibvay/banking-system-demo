export class CustomError extends Error {
  status;
  code;

  constructor({ message, status = 500, code }) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = this.constructor.name;
  }
}

function errorHandler(error, req, res, next) {
  if (error instanceof CustomError) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error",
      ...(typeof error.code === "number" && { code: error.code }),
    });
  }

  return res.status(500).json({ message: error.message || "Something went wrong" });
}

export default errorHandler;
