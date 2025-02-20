import { HttpRequest, HttpResponseInit, InvocationContext, output, StorageQueueOutput } from "@azure/functions";
import { getDbConnection } from "../dbConnection";

export async function getAllBecarios(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);
        
        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }

        context.log("Connected to database");

        // Obtiene todos los becarios
        let result = await pool.request().query("SELECT * FROM becario");
        context.log("Consulta ejecutada con éxito");

        return {
            body: JSON.stringify({ becarios: result.recordset }),
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