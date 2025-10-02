"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const zod_1 = require("zod");
// A more specific error class for your application
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    // Handle Zod validation errors (the updated way)
    if (err instanceof zod_1.ZodError) {
        // Process the issues to create a cleaner error object
        const formattedErrors = err.issues.reduce((acc, issue) => {
            const path = issue.path.join(".");
            if (!acc[path]) {
                acc[path] = [];
            }
            acc[path].push(issue.message);
            return acc;
        }, {});
        return res.status(400).json({
            message: "Validation failed",
            errors: formattedErrors,
        });
    }
    // Handle custom application errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }
    // Handle all other generic errors
    return res.status(500).json({
        message: "An unexpected internal server error occurred.",
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandlers.js.map