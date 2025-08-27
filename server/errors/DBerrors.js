import { BaseError } from "./index.js";

export class DatabaseError extends BaseError {
    constructor(message, meta = {}) {
        super(message, 'database', 500, meta);
    }
}

// Errores específicos de base de datos para mayor granularidad
export class ConnectionError extends DatabaseError {
    constructor(message, meta = {}) {
        super(message, {
            subType: 'CONNECTION',
            ...meta
        });
    }
}

export class QueryError extends DatabaseError {
    constructor(message, query, meta = {}) {
        super(message, {
            subType: 'QUERY',
            query,
            ...meta
        });
    }
}

// Error específico para operaciones de MongoDB
export class MongoOperationError extends DatabaseError {
    constructor(message, operation, collection, meta = {}) {
        super(message, {
            subType: 'MONGO_OPERATION',
            operation,
            collection,
            ...meta
        });
    }
}

// Error de conexión específico para MongoDB
export class MongoConnectionError extends DatabaseError {
    constructor(message, meta = {}) {
        super(message, {
            subType: 'MONGO_CONNECTION',
            ...meta
        });
    }
}

// Error de query específico para MongoDB
export class MongoQueryError extends DatabaseError {
    constructor(message, query, collection, meta = {}) {
        super(message, {
            subType: 'MONGO_QUERY',
            query,
            collection,
            ...meta
        });
    }
}

export class TransactionError extends DatabaseError {
    constructor(message, transactionId, meta = {}) {
        super(message, {
            subType: 'TRANSACTION',
            transactionId,
            ...meta
        });
    }
}

// Helper para detectar tipos de error de MongoDB
export class MongoErrorHandler {
    static handleError(error, context = {}) {
        const { collection, operation, filter, options } = context;

        // Errores de red/conexión
        if (this.isConnectionError(error)) {
            throw new MongoConnectionError(
                `Error de conexión MongoDB: ${error.message}`,
                {
                    originalError: error.name,
                    code: error.code,
                    collection,
                    operation,
                    ...context
                }
            );
        }

        // Errores de query/sintaxis
        if (this.isQueryError(error)) {
            throw new MongoQueryError(
                `Error en consulta MongoDB: ${error.message}`,
                JSON.stringify({ filter, options }),
                collection,
                {
                    originalError: error.name,
                    code: error.code,
                    operation,
                    ...context
                }
            );
        }

        // Error genérico de operación
        throw new MongoOperationError(
            `Error en operación MongoDB: ${error.message}`,
            operation || 'unknown',
            collection || 'unknown',
            {
                originalError: error.name,
                code: error.code,
                stack: error.stack,
                ...context
            }
        );
    }

    static isConnectionError(error) {
        const connectionErrors = [
            'MongoNetworkError',
            'MongoNetworkTimeoutError',
            'MongoServerSelectionError',
            'MongoTimeoutError'
        ];
        return connectionErrors.includes(error.name) ||
            (error.message && error.message.includes('connection'));
    }

    static isQueryError(error) {
        const queryErrors = [
            'MongoInvalidArgumentError',
            'MongoError'
        ];
        return queryErrors.includes(error.name) ||
            (error.message && (
                error.message.includes('invalid') ||
                error.message.includes('syntax') ||
                error.message.includes('projection')
            ));
    }
}