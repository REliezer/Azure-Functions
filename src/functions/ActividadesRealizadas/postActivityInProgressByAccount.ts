import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function postActivityInProgressByAccount(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);
        let pool = await getDbConnection();
        context.log("Connected to database");

        const body = await request.json() as { no_cuenta: string };
        const no_cuenta = body.no_cuenta;
        if (!no_cuenta) {
            return {
                status: 400,
                body: 'El campo no_cuenta es requerido!!'
            };
        }
        let result = await pool.request()
            .input("no_cuenta", sql.VarChar, no_cuenta)
            .execute("sp_ActividadEnProcesoPorBecario");
        context.log("Consulta ejecutada con éxito");

        if (!result || result == null) {
            return {
                status: 409,
                body: 'Internal Server Error'
            }
        }
        let responseData = {
            actividades: result.recordset
        };

        return {
            body: JSON.stringify(responseData),
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


