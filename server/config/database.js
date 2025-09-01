import { MongoClient } from "mongodb";
import environment from "./environment.js";
import { DatabaseConnectionError } from "../errors/DBerrors.js";

class DatabaseManager {
    constructor() {
        this.procesoClient = null;
        this.sistemaClient = null;
        this.catalogosClient = null;
        this.procesoDb = null;
        this.sistemaDb = null;
        this.catalogosDb = null;
    }

    async connectProceso() {
        if (!this.procesoClient) {
            this.procesoClient = new MongoClient(environment.MONGODB_PROCESO, {
                maxPoolSize: 10, // Máximo 10 conexiones en el pool
                serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
                socketTimeoutMS: 45000, // Socket timeout de 45 segundos
            });

            try {
                await this.procesoClient.connect();
                this.procesoDb = this.procesoClient.db('proceso');
                console.log("✅ Conectado a la base de datos Proceso");
            } catch (err) {
                throw new DatabaseConnectionError({
                    message: 'No se pudo conectar a la base de datos Proceso',
                    meta: { uri: environment.MONGODB_PROCESO, db: 'proceso' },
                    cause: err
                });
            }
        }
        return this.procesoDb;
    }
    async connectSistema() {
        if (!this.sistemaClient) {
            this.sistemaClient = new MongoClient(environment.MONGODB_SISTEMA, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            try {
                await this.sistemaClient.connect();
                this.sistemaDb = this.sistemaClient.db('sistema');
                console.log("✅ Conectado a la base de datos Sistema");
            } catch (err) {
                throw new DatabaseConnectionError({
                    message: 'No se pudo conectar a la base de datos Sistema',
                    meta: { uri: environment.MONGODB_SISTEMA, db: 'sistema' },
                    cause: err
                });
            }
        }
        return this.sistemaDb;
    }
    async connectCatalogos() {
        if (!this.catalogosClient) {
            this.catalogosClient = new MongoClient(environment.MONGODB_CATALOGOS, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            try {
                await this.sistemaClient.connect();
                this.sistemaDb = this.sistemaClient.db('sistema');
                console.log("✅ Conectado a la base de datos Catalogos");
            } catch (err) {
                throw new DatabaseConnectionError({
                    message: 'No se pudo conectar a la base de datos Catalogos',
                    meta: { uri: environment.MONGODB_CATALOGOS, db: 'catalogos' },
                    cause: err
                });
            }
        }
        return this.catalogosDb;
    }
    async closeConnections() {
        try {
            const promises = [];

            if (this.procesoClient) {
                promises.push(this.procesoClient.close());
                this.procesoClient = null;
                this.procesoDb = null;
            }

            if (this.sistemaClient) {
                promises.push(this.sistemaClient.close());
                this.sistemaClient = null;
                this.sistemaDb = null;
            }

            if (this.catalogosClient) {
                promises.push(this.catalogosClient.close());
                this.catalogosClient = null;
                this.catalogosDb = null;
            }

            await Promise.all(promises);
            console.log('🔌 Todas las conexiones cerradas');
        } catch (error) {
            console.error('❌ Error cerrando conexiones:', error);
            throw new DatabaseConnectionError({
                message: 'Error cerrando conexiones',
                meta: { phase: 'DatabaseService.close', collection: null, dbType: null, filter: null },
                cause: error
            });

        }
    }
    getConnectionStatus() {
        return {
            proceso: this.procesoClient?.topology?.isConnected() || false,
            sistema: this.sistemaClient?.topology?.isConnected() || false,
            catalogos: this.catalogosClient?.topology?.isConnected() || false
        };
    }
    getDatabase(dbType = 'proceso') {
        switch (dbType) {
            case "proceso":
                if (!this.procesoClient) {
                    throw new DatabaseError({
                        message: 'Cliente de base de datos proceso no inicializado',
                        meta: { dbType, phase: 'getDatabase' }
                    });
                }
                return this.procesoClient;
            case "sistema":
                if (!this.sistemaClient) {
                    throw new DatabaseError({
                        message: 'Cliente de base de datos sistema no inicializado',
                        meta: { dbType, phase: 'getDatabase' }
                    });
                }
                return this.sistemaClient;
            case "catalogos":
                if (!this.catalogosClient) {
                    throw new DatabaseError({
                        message: 'Cliente de base de datos catalogos no inicializado',
                        meta: { dbType, phase: 'getDatabase' }
                    });
                }
                return this.catalogosClient;
            default:
                throw new DatabaseError({
                    message: `Tipo de base de datos no válido: ${dbType}`,
                    meta: { dbType, validTypes: ['proceso', 'sistema', 'catalogos'] }
                });
        }
    }
}

// Exportar instancia singleton
const dbManager = new DatabaseManager();
export default dbManager;