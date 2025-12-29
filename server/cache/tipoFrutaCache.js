import customLogger from "../config/winston.config.js";
import { DatabaseError } from "../errors/DBerrors.js";
import { DatabaseService } from "../services/database.service.js";

// class tipoFrutasCache {
//     constructor() {
//         this.cache = new Map();
//     }

//     async run() {
//         try {
            

//             const data = await DatabaseService.findElements(
//                 "tipofrutas",
//                 {},
//                 'proceso', //tenia catalogos y esa ya no existe en db.Jp
//             )

//             this.setTiposFruta(data)
//         } catch (error) {
//             console.error('❌ Error en getTiposFruta:', error);

//             const dataBaseError = new DatabaseError({
//                 message: 'Error obteniendo tipos de frutas',
//                 meta: { col: 'tipoFrutas', task: 'tipoFrutasCache.run' },
//                 cause: error
//             });

//             // Loggear el error correctamente
//             customLogger.logCustomError('database', dataBaseError.message, {
//                 collection: 'tipoFruta',
//                 task: 'tipoFrutasCache.run',
//                 originalError: error.message,
//                 stack: error.stack,
//                 timestamp: new Date().toISOString()
//             });

//             // Flush logs antes de salir
//             await customLogger.flushAll();

//             // Re-lanzar el error o manejarlo según tu lógica de negocio
//             throw dataBaseError;
//         }
//     }

//     setTiposFruta(tipos) {
//         this.cache.clear();
//         tipos.forEach(tipo => {
//             console.log(`📦 Cargando tipo: ${tipo.tipoFruta}, calidades:`, tipo.calidades?.length || 0);
//             if (tipo.calidades) {
//             tipo.calidades.forEach(cal => {
//                 console.log(`   - ${cal._id}: ${cal.descripcion || cal.nombre}`);
//             });
//         }
//             this.cache.set(tipo._id.toString(), tipo);
//         });
//     }

//     getAll() {
//         return Array.from(this.cache.values());
//     }
// }

// const tipoFrutasCacheInstance = new tipoFrutasCache();
// export default tipoFrutasCacheInstance;

class tipoFrutasCache {
    constructor() {
        this.cache = new Map();
    }

    async run() {
        try {
            console.log("🔄 Cargando tipos de fruta...");
            
            // 1. Obtener todos los tipos de fruta
            const tiposFrutas = await DatabaseService.findElements(
                "tipofrutas",
                {},
                'proceso'
            );

            console.log(`✅ ${tiposFrutas.length} tipos de fruta encontrados`);

            // 2. Obtener TODAS las calidades
            const todasLasCalidades = await DatabaseService.findElements(
                "calidades",
                {},
                'proceso'
            );

            console.log(`✅ ${todasLasCalidades.length} calidades encontradas`);

            // 3. Agrupar calidades por tipoFruta
            const calidadesPorTipo = {};
            
            todasLasCalidades.forEach(calidad => {
                const tipoFrutaId = calidad.tipoFruta.toString();
                
                if (!calidadesPorTipo[tipoFrutaId]) {
                    calidadesPorTipo[tipoFrutaId] = [];
                }
                
                calidadesPorTipo[tipoFrutaId].push(calidad);
            });

            // 4. Asignar calidades a cada tipo de fruta
            tiposFrutas.forEach(tipo => {
                const tipoId = tipo._id.toString();
                tipo.calidades = calidadesPorTipo[tipoId] || [];
                
                console.log(`📦 ${tipo.tipoFruta}: ${tipo.calidades.length} calidades`);
                tipo.calidades.forEach(cal => {
                    console.log(`   - ${cal._id}: ${cal.descripcion || cal.nombre}`);
                });
            });

            this.setTiposFruta(tiposFrutas);
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
        console.log(`✅ Cache completado: ${this.cache.size} tipos de fruta`);
    }

    getAll() {
        return Array.from(this.cache.values());
    }
}

const tipoFrutasCacheInstance = new tipoFrutasCache();
export default tipoFrutasCacheInstance;