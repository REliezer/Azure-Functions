import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function postActivityByAccount(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    let pool;
    try {
        context.log(`Http function processed request for url "${request.url}"`);
        pool = await getDbConnection();
        context.log("Conexión a la base de datos establecida");

        // Obtener los datos del cuerpo de la solicitud y asegurar que tiene el tipo correcto
        const body = await request.json() as { no_cuenta: string};
        const no_cuenta = body.no_cuenta;
        if (!no_cuenta) {
            return {
                status: 400,
                body: 'El campo no_cuenta es requerido!!'
            };
        }

        // Ejecutamos el procedimiento almacenado para obtener las actividades
        let result = await pool.request()
            .input("no_cuenta", sql.VarChar, no_cuenta)
            .execute("sp_ObtenerActividadesPorRealizadasBecario");

        context.log("Consulta ejecutada con éxito");

        // Retornamos el resultado en formato JSON
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
        // Log de error
        context.log(`Error: ${error}`);
        
        // Devolver un mensaje genérico al cliente
        return {
            status: 500,
            body: 'Error interno del servidor'
        };
    } 
   
};
