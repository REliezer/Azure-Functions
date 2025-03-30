import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../../dbConnection";
import { authMiddleware } from "../../auth/authMiddleware";
import * as sql from "mssql";

export async function putAsistencia(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const authResponse = await authMiddleware(request, context, [1, 3]);
        if (authResponse) return authResponse;

        const body = await request.json() as {
            actividad_id: string;
            no_cuenta?: string;
        };

        if (!body.actividad_id) {
            return {
                status: 400,
                body: JSON.stringify({ message: "El campo 'actividad_id' es requerido." })
            };
        }

        if (!body.no_cuenta) {
            return {
                status: 400,
                body: JSON.stringify({ message: "El campo 'no_cuenta' es requerido." })
            };
        }

        // Conectar a la base de datos
        let pool = await getDbConnection();
        context.log("Connected to database");

        // Ejecutar el procedimiento almacenado
        let result = await pool.request()
            .input("actividad_id", sql.VarChar, body.actividad_id)
            .input("no_cuenta", sql.NVarChar, body.no_cuenta)
            .execute("actualizar_asistencia_actividad");

        // Verificar si la actividad fue actualizada
        if (result.rowsAffected[0] === 0) {
            return {
                status: 404,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: "La actividad no fue encontrada.",
                    actividad_id: body.actividad_id
                })
            };
        }

        // Respuesta exitosa
        return {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "La asistencia a la actividad fue registrada exitosamente.",
                data: result.recordset
            })
        };
    } catch (error) {
        context.log(`Error: ${error}`);
        let errorMessage = "Internal Server Error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return {
            status: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: errorMessage
            })
        };
    }
}