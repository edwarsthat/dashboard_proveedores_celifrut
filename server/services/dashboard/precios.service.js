// import tipoFrutasCacheInstance from "../../cache/tipoFrutaCache.js";
// import customLogger from "../../config/winston.config.js";
// import { DashboardError } from "../../errors/Services.error.js";

// export async function ponerCalidadesPrecios(precios) {
//     try {
//         const tiposFrutas = tipoFrutasCacheInstance.getAll();
//         for (const precio of precios) {
//             const tipoFruta = tiposFrutas.find(t => t._id.toString() === precio.tipoFruta.toString())
//             if (tipoFruta) {
//                 for (const calidad of Object.keys(precio.exportacion)) {
//                     if(!tipoFruta.calidades) continue;
//                     const calidadName = tipoFruta.calidades.find(c => c._id.toString() === calidad.toString());
//                     if (calidadName) {
//                         precio.exportacion[calidadName.descripcion] = precio.exportacion[calidad];
//                         delete precio.exportacion[calidad];
//                     };
//                 }
//             }
//         }
//         return precios
//     } catch (error) {
//         console.error('❌ Error en ponerCalidadesPrecios:', error);

//         const serviceError = new DashboardError({
//             message: 'Error obteniendo poniendo calidades a los precios',
//             meta: { col: 'services precios', task: 'ponerCalidadesPrecios' },
//             cause: error
//         });

//         // Loggear el error correctamente
//         customLogger.logCustomError('database', serviceError.message, {
//             collection: 'services precios',
//             task: 'ponerCalidadesPrecios',
//             originalError: error.message,
//             stack: error.stack,
//             timestamp: new Date().toISOString()
//         });

//         // Flush logs antes de salir
//         await customLogger.flushAll();

//         // Re-lanzar el error o manejarlo según tu lógica de negocio
//         throw serviceError;
//     }
// }

import tipoFrutasCacheInstance from "../../cache/tipoFrutaCache.js";
import customLogger from "../../config/winston.config.js";
import { DashboardError } from "../../errors/Services.error.js";

export async function ponerCalidadesPrecios(precios) {
    try {
        const tiposFrutas = tipoFrutasCacheInstance.getAll();
        
        for (const precio of precios) {
            const tipoFruta = tiposFrutas.find(t => t._id.toString() === precio.tipoFruta.toString());
            
            if (tipoFruta) {
                console.log("🔍 tipoFruta encontrado:", tipoFruta.tipoFruta);
                console.log("📋 Calidades disponibles:", tipoFruta.calidades);
                console.log("💰 IDs de exportacion a procesar:", Object.keys(precio.exportacion));
                
                for (const calidad of Object.keys(precio.exportacion)) {
                    if(!tipoFruta.calidades) {
                        console.warn("⚠️ tipoFruta.calidades es undefined para:", tipoFruta.tipoFruta);
                        continue;
                    }
                    
                    console.log(`🔎 Buscando calidad con ID: ${calidad}`);
                    
                    const calidadName = tipoFruta.calidades.find(c => {
                        const match = c._id.toString() === calidad.toString();
                        console.log(`  Comparando: ${c._id.toString()} === ${calidad.toString()} ? ${match}`);
                        if (match) {
                            console.log(`  ✅ Encontrada: ${c.descripcion || c.nombre}`);
                        }
                        return match;
                    });
                    
                    if (calidadName) {
                        const descripcion = calidadName.descripcion || calidadName.nombre;
                        console.log(`✅ Reemplazando ${calidad} por ${descripcion}`);
                        precio.exportacion[descripcion] = precio.exportacion[calidad];
                        delete precio.exportacion[calidad];
                    } else {
                        console.error(`❌ NO SE ENCONTRÓ calidad para ID: ${calidad}`);
                        console.error(`   Calidades disponibles:`, tipoFruta.calidades.map(c => ({
                            id: c._id.toString(),
                            nombre: c.descripcion || c.nombre
                        })));
                    }
                }
            }
        }
        return precios;
    } catch (error) {
        console.error('❌ Error en ponerCalidadesPrecios:', error);

        const serviceError = new DashboardError({
            message: 'Error obteniendo poniendo calidades a los precios',
            meta: { col: 'services precios', task: 'ponerCalidadesPrecios' },
            cause: error
        });

        // Loggear el error correctamente
        customLogger.logCustomError('database', serviceError.message, {
            collection: 'services precios',
            task: 'ponerCalidadesPrecios',
            originalError: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        // Flush logs antes de salir
        await customLogger.flushAll();

        // Re-lanzar el error o manejarlo según tu lógica de negocio
        throw serviceError;
    }
}