import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function getParticipantesByActividadId(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
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
            .execute("participantes_actividad");  // Llamamos al procedimiento almacenado

        if (result.rowsAffected[0] === 0) {
            return { status: 404, body: "No hay participantes en esta actividad aún." };
        }

        let responseData = JSON.stringify(result.recordset);

        return { status: 200, body: responseData };
    } catch (error) {
        if (error instanceof sql.RequestError && error.number === 50000) {
            context.log(`Error personalizado: ${error.message}`);
            return {
                status: 400,
                body: "No se encontró la actividad con el ID proporcionado.",
            };
        } else {
            context.log(`Error: ${error}`);
            return {
                status: 500,
                body: 'Internal Server Error'
            };
        }
    }
}