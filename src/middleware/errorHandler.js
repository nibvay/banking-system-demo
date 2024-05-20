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
  // console.log("[errorHandler]", error);
  if (error instanceof CustomError) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }

  return res.status(500).json({ message: error.message || "Something went wrong" });
}

export default errorHandler;
