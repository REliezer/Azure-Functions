import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function putActivityAvailable(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        // Parsear y validar el cuerpo de la solicitud
        const body = await request.json() as {
            actividad_id: string;
            nombre_actividad?: string;
            descripcion?: string;
            fecha_actividad?: string;
            numero_horas?: number;
            ubicacion?: string;
            imagen?: string;
            estado_actividad?: string;
            organizador?: string;
        };

        if (!body.actividad_id) {
            return {
                status: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "El campo 'actividad_id' es requerido." })
            };
        }

        // Conectar a la base de datos
        let pool = await getDbConnection();
        context.log("Connected to database");

        // Ejecutar el procedimiento almacenado
        let result = await pool.request()
            .input("actividad_id", sql.NVarChar, body.actividad_id)
            .input("nombre_actividad", sql.NVarChar, body.nombre_actividad || null)
            .input("descripcion", sql.NVarChar, body.descripcion || null)
            .input("fecha_actividad", sql.DateTime, body.fecha_actividad || null)
            .input("numero_horas", sql.Int, body.numero_horas || null)
            .input("ubicacion", sql.NVarChar, body.ubicacion || null)
            .input("imagen", sql.NVarChar, body.imagen || null)
            .input("estado_actividad", sql.NVarChar, body.estado_actividad || null)
            .input("organizador", sql.NVarChar, body.organizador || null)
            .execute("UpdateActividad");

        // Verificar si la actividad fue actualizada
        if (result.rowsAffected[0] === 0) {
            return {
                status: 404,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    message: "La actividad no fue encontrada.",
                    actividad_id: body.actividad_id
                })
            };
        }

        // Respuesta exitosa
        return {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: "La actividad fue actualizada exitosamente.",
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