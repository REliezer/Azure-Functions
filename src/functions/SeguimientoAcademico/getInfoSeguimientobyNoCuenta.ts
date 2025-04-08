import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import { authMiddleware } from "../auth/authMiddleware";
import * as sql from "mssql";
const jwt = require('jsonwebtoken');

export async function getInfoSeguimientobyNoCuenta(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        // Verificar autenticación y rol (1 3)
        const authResponse = await authMiddleware(request, context, [1, 3]);
        if (authResponse) return authResponse;

        const no_cuenta = request.params.no_cuenta;
        if (!no_cuenta) {
            return { status: 400, body: "Falta el parámetro 'no_cuenta'." };
        }
        
        context.log(`Solicitud de seguimiento para cuenta: ${request.params.no_cuenta}`);

        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }
        context.log("Connected to database");

        let infoSeguimiento = await pool.request()
            .input("no_cuenta", sql.NVarChar, no_cuenta)
            .execute("get_info_becario_seguimiento_by_noCuenta");

        if (infoSeguimiento.rowsAffected[0] === 0) {
            return {
                status: 404,
                body: JSON.stringify({ error: 'No se encontró el becario', status: false}),
            };
        }

        return {
            status: 200,
            body: JSON.stringify(infoSeguimiento.recordset[0])
        };
    } catch (error) {
        return {
            status: 404,
            body: JSON.stringify({ error: `No se encontró el becario` })
        };
    }
}