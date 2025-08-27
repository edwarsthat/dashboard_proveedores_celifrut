import { JobError } from "../errors/JobError.js";
import { DatabaseService } from "../services/database.service.js";

export async function getAuthorizedEmails() {
    try{
        // Lógica para obtener correos autorizados
        const status = DatabaseService.getStatus();

        if(!status.proceso){
            await DatabaseService.run()
        }

        const data = DatabaseService.findElements(
            "proveedors", 
            {activo: true},
            'proceso',
            {projection:{correo_informes:1}}
        )
        console.log(data)
    } catch (err){
        throw new JobError('Error obteniendo correos autorizados: ' + err.message);
    }
}