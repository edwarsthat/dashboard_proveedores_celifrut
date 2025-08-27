import errorLogger from "../config/winston.config.js";
import { safeRedact, serializeCause } from "./utils/index.js";


export class BaseError extends Error {
    constructor(
        message,
        errorType = 'system',
        statusCode = 500,
        meta = {},
        errorCode = 'INTERNAL_ERROR',
        isOperational = true,
        cause = undefined
    ) {
        super(message);
        this.name = this.constructor.name;
        this.errorType = errorType;
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        this.meta = meta;
        this.cause = cause;

        // Mantener el stack trace limpio
        Object.setPrototypeOf(this, new.target.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, new.target);
        }

    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            errorType: this.errorType,
            errorCode: this.errorCode,
            statusCode: this.statusCode,
            isOperational: this.isOperational,
            timestamp: this.timestamp,
            meta: safeRedact(this.meta),
            cause: serializeCause(this.cause),
            stack: this.stack
        };
    }

    logError() {
        const logData = {
            errorName: this.name,
            errorCode: this.errorCode,
            statusCode: this.statusCode,
            stack: this.stack,
            timestamp: this.timestamp,
            isOperational: this.isOperational,
            ...this.meta
        };

        console.log(`🚨 BaseError.logError() - Tipo: ${this.errorType}, Mensaje: ${this.message}`); // Debug
        errorLogger.logCustomError(this.errorType, this.message, logData);
    }
}



export class AppInitError extends BaseError {
    constructor(params = {}) {
        const {
            message = 'Fallo en la inicialización de la aplicación',
            statusCode = 500,
            meta = {},
            errorCode = 'APP.INIT_FAILED',
            isOperational = true,
            cause
        } = params;

        super(
            message,         // message
            'system',        // errorType
            statusCode,      // statusCode
            meta,            // meta
            errorCode,       // errorCode
            isOperational,   // isOperational
            cause            // cause
        );
    }
}