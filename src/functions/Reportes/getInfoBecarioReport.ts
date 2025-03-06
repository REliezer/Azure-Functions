import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function getInfoBecarioReport(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        const no_cuenta = request.params.id;
        if (!no_cuenta) {
            return {
                status: 400,
                body: 'El campo no_cuenta es requerido!!'
            };
        }

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
            .input("no_cuenta", sql.NVarChar, no_cuenta)
            .execute("informacion_becario_planilla_by_cuenta");  // Llamamos al procedimiento almacenado

        if (result.rowsAffected[0] === 0) {
            return { status: 404, body: "No hay ningun becario con este no_cuenta." };
        }

        let responseData = JSON.stringify(result.recordset);

        return { status: 200, body: responseData };
    } catch (error) {
        if (error instanceof sql.RequestError && error.number === 50000) {
            context.log(`Error personalizado: ${error.message}`);
            return {
                status: 400,
                body: "No se encontró reportes con el no_cuenta proporcionado.",
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