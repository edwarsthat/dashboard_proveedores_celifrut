import { BaseError } from "./index.js";

export class DatabaseConnectionError extends BaseError {
    constructor({ message = 'Error de conexión a la base de datos', meta = {}, cause } = {}) {
        super(
            message,
            'database',
            500,
            meta,
            'DB.CONNECTION',
            false,
            cause
        );
        this.logError(); // auto-log al crearse
    }
}

export class DatabaseError extends BaseError {
    constructor({ message = 'Error de base de datos', meta = {}, cause } = {}) {
        super(message, 'database', 500, meta, 'DB.GENERIC', false, cause);
        this.logError(); // manda a winston (transporte database)
    }
}