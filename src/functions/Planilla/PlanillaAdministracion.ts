import { HttpRequest, HttpResponseInit, InvocationContext} from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function getPlanillaAdministracion(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

             // Conectar a la base de datos
        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }
        context.log("Connected to database");

        // Obtiene las planillas disponibles
        let result = await pool.request()
            .execute("SEL_planilla");

        //context.log("Consulta ejecutada con éxito");

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

