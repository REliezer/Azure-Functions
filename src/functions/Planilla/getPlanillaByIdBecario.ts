import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function getplanillaByIdBecario(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        const body = await request.json() as {
            becario_id: string;
            beca_id: number;
        };

        context.log('body: ', body);
        if (!body.becario_id || body.becario_id === null || body.becario_id === undefined) {
            return {
                status: 400,
                body: JSON.stringify("Falta parametros obligatorios.")
            };
        }

        // Conectar a la base de datos
        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }
        context.log("Connected to database");

        // Obtiene las planillas disponibles
        let result = await pool.request()
            .input('becario_id', sql.VarChar, body.becario_id)
            .input('beca_id', sql.Int, body.beca_id)
            .execute("get_informacion_planilla_by_cuenta");

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