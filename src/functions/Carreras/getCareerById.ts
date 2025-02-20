import { HttpRequest, HttpResponseInit, InvocationContext, output, StorageQueueOutput } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function getCareerById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        const carrera_id = request.params.id;
        if (!carrera_id) {
            return { status: 400, body: 'El campo carrera_id es requerido' };
        }

        context.log(`Received carrera_id: ${carrera_id}`);

        // Conectar a la base de datos
        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }
        context.log("Connected to database");

        // Obtiene el nombre de una carrera segun id
        let result = await pool.request()
            .input('carreraId', sql.NChar, carrera_id)
            .query("SELECT nombre_carrera FROM carreras WHERE carrera_id = @carreraId");
        
        context.log("Consulta ejecutada con éxito");

        // Obtener el nombre de la carrera como una cadena
        let nombreCarrera = result.recordset.length > 0 ? result.recordset[0].nombre_carrera : 'Carrera no encontrada';

        return {
            body: nombreCarrera, // Devolver solo el nombre de la carrera
            headers: {
                'Content-Type': 'text/plain'
            }
        };

    } catch (error) {
        context.log(`Error: ${error}`);
        return {
            status: 500,
            body: 'Internal Server Error'
        };
    }
};


