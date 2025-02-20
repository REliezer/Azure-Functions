import { HttpRequest, HttpResponseInit, InvocationContext, output, StorageQueueOutput } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";


export async function getBecarioNoCuenta(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);
        
        let no_cuenta: string | undefined;
        try {
            const body = await request.json() as { no_cuenta?: string };
            no_cuenta = body.no_cuenta;
            if (!no_cuenta) {
                return { status: 400, body: 'El campo no_cuenta es requerido' };
            }
        } catch (error) {
            return { status: 400, body: 'Solicitud inválida, se esperaba un JSON' };
        }

        context.log(`Received no_cuenta: ${no_cuenta}`);

        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }
        context.log("Connected to database");

        // Obtiene un becario por numero de cuenta
        let result = await pool.request()
        .input('noCuenta', sql.NVarChar, no_cuenta)
            .query("SELECT * FROM becario WHERE no_cuenta = @noCuenta");
        context.log("Consulta ejecutada con éxito");

        return {
            body: JSON.stringify({ becario: result.recordset }),
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


