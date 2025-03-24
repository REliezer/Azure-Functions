import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function getInfoSeguimientobyNoCuenta(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log("Procesando solicitud para obtener info de seguimiento...");
    try {
        const no_cuenta = request.params.no_cuenta;
        if (!no_cuenta) {
            return { status: 400, body: "Falta el parámetro 'no_cuenta'." };
        }
        console.log('body.no_cuenta', no_cuenta);

        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }
        context.log("Connected to database");

        // Obtener la información de seguimiento
        let infoSeguimiento = await pool.request()
            .input("no_cuenta", sql.NVarChar, no_cuenta)
            .execute("get_info_becario_seguimiento_by_noCuenta");

        if (infoSeguimiento.rowsAffected[0] === 0) {
            return { 
                status: 404, 
                body: JSON.stringify({body: 'No se encontró el becario', status: false}),
                
            };
        }
        console.log('infoSeguimiento', infoSeguimiento);
        // Retornar respuesta
        return { 
            status: 200, 
            body: JSON.stringify(infoSeguimiento.recordset)
        };
    } catch (error) {
        context.log("Error al obtener info de seguimiento:", error);
        return { 
            status: 404, 
            body: JSON.stringify({ error: `Error al obtener info de seguimiento.` }) 
        };
    }
}