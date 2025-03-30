import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import { authMiddleware } from "../auth/authMiddleware";
import * as sql from "mssql";

export async function getParticipantesByActividadId(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const authResponse = await authMiddleware(request, context, [1, 3]);
        if (authResponse) return authResponse;

        context.log(`Http function processed request for url "${request.url}"`);
        const actividad_id = request.params.id;
        if (!actividad_id) {
            return {
                status: 400,
                body: 'El campo actividad_id es requerido!!'
            };
        }

        context.log(`Received actividad_id: ${actividad_id}`);

        let pool = await getDbConnection();
        if (!pool) {
            return {
                status: 500,
                body: 'No se pudo conectar a la base de datos'
            };
        }
        context.log("Connected to database");

        // Ejecutar el procedimiento almacenado
        let result = await pool.request()
            .input("actividad_id", sql.VarChar, actividad_id)
            .execute("participantes_actividad");

        if (result.rowsAffected[0] === 0) {
            return {
                status: 404,
                body: JSON.stringify({ error: "No hay participantes en esta actividad aún."}),
            };
        }

        let responseData = JSON.stringify(result.recordset);

        return { status: 200, body: responseData };
    } catch (error) {
        if (error instanceof sql.RequestError && error.number === 50000) {
            context.log(`Error personalizado: ${error.message}`);
            return {
                status: 400,
                body: JSON.stringify({ error: error.message }),
            };
        } else {
            context.log(`Error: ${error}`);
            return {
                status: 500,
                body: JSON.stringify({ error: 'Internal Server Error' }),
            };
        }
    }
}