putActivityAvailable
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function putActivityAvailable(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

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

        let pool = await getDbConnection();
        context.log("Connected to database");

        let result = await pool.request()
            .input("actividad_id", sql.NChar, body.actividad_id)
            .input("nombre_actividad", sql.NVarChar, body.nombre_actividad)
            .input("descripcion", sql.NVarChar, body.descripcion)
            .input("fecha_actividad", sql.Date, body.fecha_actividad)
            .input("numero_horas", sql.Int, body.numero_horas)
            .input("ubicacion", sql.NVarChar, body.ubicacion)
            .input("imagen", sql.NVarChar, body.imagen)
            .input("estado_actividad", sql.NVarChar, body.estado_actividad)
            .input("organizador", sql.NVarChar, body.organizador)
            .query(`
                UPDATE actividades_disponibles
                SET 
                nombre_actividad = @nombre_actividad,
                descripcion = @descripcion,
                fecha_actividad = @fecha_actividad,
                numero_horas = @numero_horas,
                ubicacion = @ubicacion,
                imagen = @imagen,
                estado_actividad = @estado_actividad,
                organizador = @organizador
                WHERE actividad_id = @actividad_id
            `);

        if (result.rowsAffected[0] === 0) {
            return { status: 404, body: "La actividad no fue encontrada." };
        }

        let responseData = {
            actividades: result.recordset
        };

        return { status: 200, body: "La actividad fue actualizada exitosamente." };
    } catch (error) {
        context.log(`Error: ${error}`);
        return {
            status: 500,
            body: 'Internal Server Error'
        };
    }
};


