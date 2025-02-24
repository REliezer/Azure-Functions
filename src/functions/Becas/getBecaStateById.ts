import { HttpRequest, HttpResponseInit, InvocationContext, output, StorageQueueOutput } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function getBecaStateById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        const estado_beca_id = request.params.id;
        if (!estado_beca_id) {
            return {
                status: 400,
                body: 'El campo estado_beca_id es requerido'
            };
        }

        // Conectar a la base de datos
        let pool = await getDbConnection();
        if (!pool) {
            return {
                status: 500,
                body: 'No se pudo conectar a la base de datos'
            };
        }
        context.log("Connected to database");

        let result = await pool.request()
            .input('estadoBecaId', sql.NChar, estado_beca_id)
            .query("SELECT estado_beca FROM estado_beca WHERE estado_beca_id = @estadoBecaId");
        
        context.log("Consulta ejecutada con éxito");
        let nombreEstadoBeca = result.recordset.length > 0 ? result.recordset[0].estado_beca : 'Estado no disponible';

        return {
            status: 200,
            body: nombreEstadoBeca,
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


