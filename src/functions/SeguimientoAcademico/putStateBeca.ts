import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function putStateBeca(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log("Procesando solicitud para actualizar el estado de la beca...");
    try {
        const body = await request.json() as { no_cuenta?: string; estado_beca_id?: string };

        if (!body.no_cuenta || !body.estado_beca_id) {
            return { status: 400, body: "Falta el parámetro 'no_cuenta' y 'estado_beca_id'." };
        }

        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }
        context.log("Connected to database");

        let result = await pool.request()
            .input("no_cuenta", sql.NVarChar, body.no_cuenta)
            .input("estado_beca_id", sql.Int, body.estado_beca_id)
            .execute("actualizar_estado_beca");

        if (result.rowsAffected[0] === 0) {
            return { status: 404, body: "No se encontró la beca." };
        }

        return { status: 200, body: JSON.stringify("Estado de la beca actualizado correctamente.") };
    } catch (error) {
        context.log("Error al actualizar el estado de la beca:", error);
        return { status: 404, body: JSON.stringify("Error al actualizar el estado de la beca.") };
    }
}  