import { MongoClient } from "mongodb";
import environment from "./environment.js";
import { DatabaseError } from "../errors/DBerrors.js";

class DatabaseManager {
    constructor() {
        this.procesoClient = null;
        this.sistemaClient = null;
        this.procesoDb = null;
        this.sistemaDb = null;
    }

    async connectProceso() {
        if (!this.procesoClient) {
            this.procesoClient = new MongoClient(environment.MONGODB_PROCESO, {
                maxPoolSize: 10, // Máximo 10 conexiones en el pool
                serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
                socketTimeoutMS: 45000, // Socket timeout de 45 segundos
            });

            await this.procesoClient.connect();
            this.procesoDb = this.procesoClient.db('proceso');
            console.log("✅ Conectado a la base de datos Proceso");
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

            await this.sistemaClient.connect();
            this.sistemaDb = this.sistemaClient.db('sistema');
            console.log("✅ Conectado a la base de datos Sistema");
        }
        return this.sistemaDb;
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

            await Promise.all(promises);
            console.log('🔌 Todas las conexiones cerradas');
        } catch (error) {
            console.error('❌ Error cerrando conexiones:', error);
            throw new DatabaseError('❌ Error cerrando conexiones:', error.message);

        }
    }

    getConnectionStatus() {
        return {
            proceso: this.procesoClient?.topology?.isConnected() || false,
            sistema: this.sistemaClient?.topology?.isConnected() || false
        };
    }

    getDatabase(dbType = 'proceso') {
        switch (dbType) {
            case "proceso":
                return this.procesoClient;
            case "sistema":
                return this.sistemaClient;
            default:
                throw new DatabaseError('Error obteniendo el cliente de la base de datos, elija una base de datos valida');
        }
    }
}

// Exportar instancia singleton
const dbManager = new DatabaseManager();
export default dbManager;