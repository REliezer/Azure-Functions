import { HttpRequest, HttpResponseInit, InvocationContext, output, StorageQueueOutput } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function getBecaById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        const body = await request.json() as {
            beca_id: string;
            becario_id: string;
        };

        if (!body.beca_id || !body.becario_id) {
            return {
                status: 400,
                body: JSON.stringify('Faltan parámetros obligatorios.')
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

        // Obtiene los detalles de una beca segun id
        let result = await pool.request()
            .input('beca_id', sql.Int, body.beca_id)
            .input('becario_id', sql.VarChar, body.becario_id)
            .execute('sp_informacion_beca_by_beca_id');

        context.log("Consulta ejecutada con éxito");

        return {
            status: 200,
            body: JSON.stringify({beca: result.recordset[0], status: true}),
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


