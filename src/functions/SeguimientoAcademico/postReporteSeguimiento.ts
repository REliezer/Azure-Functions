import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import { authMiddleware } from "../auth/authMiddleware";
import * as sql from "mssql";
import { json } from "stream/consumers";

export async function postReporteSeguimiento(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const customErrors = [50000, 50001, 50002, 50003];
    try {
        const authResponse = await authMiddleware(request, context, [1, 3]);
        if (authResponse) return authResponse;

        context.log("Procesando solicitud para ingresar el reporte de seguimiento...");

        const body = await request.json() as {
            no_cuenta: string;
            nombre_estado_anterior: string;
            empleado_id: string;
            nombre_reporte: string;
            fecha_reporte?: string;
            estado_nuevo_beca_id?: number;
            motivo_cambio_estado_beca?: string;
            total_horas: number;
            observaciones?: string;
            enlace: string;
        };
        context.log('body: ', body);
        if (!body.no_cuenta || !body.nombre_estado_anterior || !body.empleado_id || !body.nombre_reporte || body.total_horas === null || body.total_horas === undefined || !body.enlace) {
            return {
                status: 400,
                body: JSON.stringify("Falta el parámetro 'no_cuenta', 'nombre_estado_anterior', 'empleado_id', 'nombre_reporte', 'enlace' y 'total_horas'.")
            };
        }

        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }
        
        context.log("Connected to database");

        let result = await pool.request()
            .input("no_cuenta", sql.NVarChar, body.no_cuenta)
            .input("nombre_estado_anterior", sql.NVarChar, body.nombre_estado_anterior)
            .input("empleado_id", sql.NChar, body.empleado_id)
            .input("nombre_reporte", sql.NVarChar, body.nombre_reporte)
            .input("fecha_reporte", sql.Date, body.fecha_reporte)
            .input("estado_nuevo_beca_id", sql.Int, body.estado_nuevo_beca_id)
            .input("motivo_cambio_estado_beca", sql.NVarChar, body.motivo_cambio_estado_beca)
            .input("total_horas", sql.Int, body.total_horas)
            .input("observaciones", sql.NVarChar, body.observaciones)
            .input("enlace", sql.NVarChar, body.enlace)
            .execute("insert_nuevo_reporte");

        if (result.rowsAffected[0] === 0) {
            return { status: 404, body: JSON.stringify({ message: "Reporte de seguimiento no creado." }) };
        }

        return {
            status: 200,
            body: JSON.stringify({ message: "Reporte de seguimiento creado correctamente." })
        };
    } catch (error) {
        if (error instanceof sql.RequestError && typeof error.number === "number" && customErrors.includes(error.number)) {
            context.log(`Error personalizado: ${error.message}`);
            return {
                status: 400,
                body: JSON.stringify({ error: error.message })
            };
        } else {
            context.log(`Error desconocido: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
            return {
                status: 500,
                body: JSON.stringify({ error: `Error desconocido: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}` })
            };
        }
    }
}