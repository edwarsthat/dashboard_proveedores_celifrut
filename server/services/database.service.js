import dbManager from "../config/database.js";
import { DatabaseError } from "../errors/DBerrors.js";
import { BaseError } from "../errors/index.js";

export class DatabaseService {
    static async run() {
        try {
            await dbManager.connectProceso();
            await dbManager.connectSistema();
            //await dbManager.connectCatalogos(); no se usa.Jp
            console.log("🚀 Servicios de base de datos inicializados");
        } catch (error) {
            console.error("❌ Error inicializando servicios de base de datos:", error);
            if (error instanceof BaseError) throw error; // ✅ no romper el stack original
            throw new DatabaseError({
                message: 'Error inicializando servicios de base de datos',
                meta: { phase: 'DatabaseService.run' },
                cause: error
            });
        }
    }
    static async runProceso() {
        try {
            await dbManager.connectProceso();
            console.log("🚀 Servicios de base de datos inicializados");
        } catch (error) {
            console.error("❌ Error inicializando servicios de base de datos:", error);
            if (error instanceof BaseError) throw error; // ✅ no romper el stack original
            throw new DatabaseError({
                message: 'Error inicializando servicios de base de datos',
                meta: { phase: 'DatabaseService.connectProceso' },
                cause: error
            });
        }
    }
    static async close() {
        try {
            await dbManager.closeConnections();
            console.log("🔒 Servicios de base de datos cerrados");
        } catch (error) {
            console.error("❌ Error cerrando servicios de base de datos:", error);
            if (error instanceof BaseError) throw error; // ✅ no romper el stack original
            throw new DatabaseError({
                message: 'Error cerrando servicios de base de datos',
                meta: { phase: 'DatabaseService.close' },
                cause: error
            });
        }
    }
    static getStatus() {
        return dbManager.getConnectionStatus();
    }
    // Método para buscar documentos con filtros
    static async findElements(collection, filter = {}, dbType = 'proceso', options = {}) {
        try {
            const dbInstance = dbManager.getDatabase(dbType);

            if (!dbInstance) {
                throw new DatabaseError({
                    message: `No hay conexión a la base de datos ${dbType}`,
                    meta: { dbType, collection }
                });
            }

            // Obtener la base de datos correcta según el tipo
            let db;
            switch (dbType) {
                case 'proceso':
                    db = dbInstance.db('proceso');
                    break;
                case 'sistema':
                    db = dbInstance.db('sistema');
                    break;
                // case 'catalogos':
                //     db = dbInstance.db('catalogos');  no se usa catalogos.Jp
                //     break;
                default:
                    throw new DatabaseError({
                        message: `Tipo de base de datos no válido: ${dbType}`,
                        meta: { dbType, collection }
                    });
            }

            if (!db || typeof db.collection !== 'function') {
                throw new DatabaseError({
                    message: 'Instancia de DB inválida para findElements',
                    meta: { dbType, got: typeof db }
                });
            }

            const { limit, skip, sort, projection } = options;
            let cursor = db.collection(collection).find(filter);

            if (projection) cursor = cursor.project(projection);
            if (sort) cursor = cursor.sort(sort);
            if (skip) cursor = cursor.skip(skip);
            if (limit) cursor = cursor.limit(limit);

            return await cursor.toArray();
        } catch (error) {
            console.error(`❌ Error buscando elementos en ${collection}:`, error.message);
            if (error instanceof BaseError) throw error; // ✅ no romper el stack original
            throw new DatabaseError({
                message: `Error buscando elementos en ${collection}`,
                meta: { phase: 'DatabaseService.findElements', collection, dbType, filter },
                cause: error
            });

        }
    }
}

