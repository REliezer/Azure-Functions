import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function getReportByNoCuenta(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        const no_cuenta = request.params.id;
        if (!no_cuenta) {
            return {
                status: 400,
                body: 'El campo no_cuenta es requerido!!'
            };
        }

        context.log(`Received no_cuenta: ${no_cuenta}`);

        let pool = await getDbConnection();
        if (!pool) {
            return {
                status: 500,
                body: 'No se pudo conectar a la base de datos'
            };
        }
        context.log("Connected to database");

        let result = await pool.request()
            .input("no_cuenta", sql.VarChar, no_cuenta)
            .execute("reportes_becario_by_no_cuenta");

        if (result.rowsAffected[0] === 0) {
            return { status: 404, body: "No hay reportes para este becario aún." };
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