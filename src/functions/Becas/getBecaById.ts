import { HttpRequest, HttpResponseInit, InvocationContext, output, StorageQueueOutput } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function getBecaById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        const beca_id = request.params.id;
        if (!beca_id) {
            return { status: 400, body: 'El campo beca_id es requerido' };
        }
        // Conectar a la base de datos
        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }
        context.log("Connected to database");

        // Obtiene los detalles de una beca segun id
        let result = await pool.request()
            .input('becaId', sql.Int, beca_id)
            .query("SELECT * FROM becas WHERE beca_id = @becaId");

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


