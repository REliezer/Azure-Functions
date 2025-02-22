import { HttpRequest, HttpResponseInit, InvocationContext, output, StorageQueueOutput } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function planillaByIdBecario(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        const becario_id = request.params.id;
        if (!becario_id) {
            return { status: 400, body: 'El campo becario_id es requerido' };
        }
        // Conectar a la base de datos
        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }
        context.log("Connected to database");

        // Obtiene las planillas disponibles
        let result = await pool.request()
            .input('becario_id', sql.NChar, becario_id)
            .query("SELECT * FROM planilla_x_mes WHERE becario_id = @becario_id");

        context.log("Consulta ejecutada con éxito");

        return {
            body: JSON.stringify(result.recordset),
            headers: {
                'Content-Type': 'application/json'
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


