import { HttpRequest, HttpResponseInit, InvocationContext, output, StorageQueueOutput } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function getPersonaById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        const persona_id = request.params.id;
        if (!persona_id) {
            return {
                status: 400,
                body: 'El campo persona_id es requerido'
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

        // Obtiene los detalles de una persona segun id
        let result = await pool.request()
            .input('personaId', sql.Int, persona_id)
            .query("SELECT * FROM persona WHERE persona_id = @personaId");

        context.log("Consulta ejecutada con éxito");

        return {
            status: 200,
            body: JSON.stringify({person: result.recordset[0], status: true}),
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


