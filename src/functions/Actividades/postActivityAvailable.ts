import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";
import { ActivityValidator } from "./ValidacionesActividades/ActivityValidatorBody";

export async function postActivityAvailable(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
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
            .execute("sp_insertar_actividad");

           // console.log(result);
        // Respuesta exitosa
        return {
            status: 201,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "La actividad Creada exitosamente.",
                data: result.recordset // Opcional: incluir datos adicionales
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
