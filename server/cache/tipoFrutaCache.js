import customLogger from "../config/winston.config.js";
import { DatabaseError } from "../errors/DBerrors.js";
import { DatabaseService } from "../services/database.service.js";

class tipoFrutasCache {
    constructor() {
        this.cache = new Map();
    }

    async run() {
        try {
            const data = await DatabaseService.findElements(
                "tipofrutas",
                {},
                'proceso', //tenia catalogos y esa ya no existe en db.Jp
            )

            this.setTiposFruta(data)
        } catch (error) {
            console.error('❌ Error en getTiposFruta:', error);

            const dataBaseError = new DatabaseError({
                message: 'Error obteniendo tipos de frutas',
                meta: { col: 'tipoFrutas', task: 'tipoFrutasCache.run' },
                cause: error
            });

            // Loggear el error correctamente
            customLogger.logCustomError('database', dataBaseError.message, {
                collection: 'tipoFruta',
                task: 'tipoFrutasCache.run',
                originalError: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });

            // Flush logs antes de salir
            await customLogger.flushAll();

            // Re-lanzar el error o manejarlo según tu lógica de negocio
            throw dataBaseError;
        }
    }

    setTiposFruta(tipos) {
        this.cache.clear();
        tipos.forEach(tipo => {
            this.cache.set(tipo._id.toString(), tipo);
        });
    }

    getAll() {
        return Array.from(this.cache.values());
    }
}

const tipoFrutasCacheInstance = new tipoFrutasCache();
export default tipoFrutasCacheInstance;