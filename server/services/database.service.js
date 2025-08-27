import dbManager from "../config/database.js";
import { DatabaseError, MongoErrorHandler } from "../errors/DBerrors.js";

export class DatabaseService {
    static async run() {
        try {
            await dbManager.connectProceso();
            await dbManager.connectSistema();
            console.log("🚀 Servicios de base de datos inicializados");
        } catch (error) {
            console.error("❌ Error inicializando servicios de base de datos:", error);
            throw new DatabaseError('Error corriendo servicios de base de datos: ' + error.message);
        }
    }
    static async runProceso() {
        try {
            await dbManager.connectProceso();
            console.log("🚀 Servicios de base de datos inicializados");
        } catch (error) {
            console.error("❌ Error inicializando servicios de base de datos:", error);
            throw new DatabaseError('Error corriendo servicios de base de datos: ' + error.message);
        }
    }

    static async close() {
        try {
            await dbManager.closeConnections();
            console.log("🔒 Servicios de base de datos cerrados");
        } catch (error) {
            console.error("❌ Error cerrando servicios de base de datos:", error);
            throw new DatabaseError('Error cerrando servicios de base de datos: ' + error.message);
        }
    }

    static getStatus() {
        return dbManager.getConnectionStatus();
    }

    // Método para buscar documentos con filtros
    static async findElements(collection, filter = {}, dbType = 'proceso', options = {}) {
        try {
            const db = await dbManager.getDatabase("proceso");
            const { limit, skip, sort, projection } = options;

            let cursor = db.collection(collection).find(filter);

            if (projection) cursor = cursor.project(projection);
            if (sort) cursor = cursor.sort(sort);
            if (skip) cursor = cursor.skip(skip);
            if (limit) cursor = cursor.limit(limit);

            return await cursor.toArray();
        } catch (error) {
            console.error(`❌ Error buscando elementos en ${collection}:`, error.message);

            // Usar el handler centralizado
            MongoErrorHandler.handleError(error, {
                collection,
                operation: 'findElements',
                dbType,
                filter,
                options
            });

        }
    }
}

