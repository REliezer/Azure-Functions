import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import { authMiddleware } from "../auth/authMiddleware";
import * as sql from "mssql";
import { ActivityValidator } from "./ValidacionesActividades/ActivityValidatorBody";

export async function postActivityAvailable(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const authResponse = await authMiddleware(request, context, [1, 3]);
        if (authResponse) return authResponse;

        context.log(`Http function processed request for url "${request.url}"`);

        // Parsear el cuerpo de la solicitud
        const body = await request.json() as {
            nombre_actividad?: string;
            descripcion?: string;
            fecha_actividad?: string;
            numero_horas?: number;
            ubicacion?: string;
            imagen?: string;
            estado_actividad?: string;
            organizador?: string;
            centro_id?: number;
        };

        // Validar los datos de entrada usando el validador
        const validationResult = ActivityValidator.validate(body);
        if (!validationResult.valid) {
            return {
                status: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: validationResult.message
                })
            };
        }

        // Conectar a la base de datos
        let pool = await getDbConnection();
        context.log("Connected to database");

        // Ejecutar el procedimiento almacenado
        let result = await pool.request()
            .input("nombre_actividad", sql.NVarChar, body.nombre_actividad)
            .input("descripcion", sql.NVarChar, body.descripcion)
            .input("fecha_actividad", sql.DateTime, body.fecha_actividad)
            .input("numero_horas", sql.Int, body.numero_horas)
            .input("ubicacion", sql.NVarChar, body.ubicacion)
            .input("imagen", sql.NVarChar, body.imagen)
            .input("estado_actividad", sql.NVarChar, body.estado_actividad)
            .input("organizador", sql.NVarChar, body.organizador)
            .input("centro_id", sql.Int, body.centro_id)
            .execute("sp_insertar_actividad");

        return {
            status: 201,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Actividad guardada con éxito.",
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
