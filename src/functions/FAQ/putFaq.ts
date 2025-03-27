import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function putPreguntas(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        // Parsear y validar el cuerpo de la solicitud
        const body = await request.json() as {
            pregunta_id: number;
            pregunta: string;
            respuesta: string;

        };

        const requiredFields: (keyof typeof body)[] = ["pregunta_id", "pregunta", "respuesta"];

        const missingField = requiredFields.find(field => !body[field]);
        
        if (missingField) {
            return {
                status: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: `El campo '${missingField}' es requerido.` })
            };
        }
        

        // Conectar a la base de datos
        let pool = await getDbConnection();
        context.log("Connected to database");

        // Ejecutar el procedimiento almacenado
        let result = await pool.request()
            .input("pregunta_id", sql.Numeric, body.pregunta_id)
            .input("pregunta", sql.NVarChar, body.pregunta || null)
            .input("respuesta", sql.NVarChar, body.respuesta || null)

            .execute("sp_updatePreguntas");

        // Verificar si la pregunta fue actualizada
        if (result.rowsAffected[0] === 0) {
            return {
                status: 404,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    message: "La pregunta no fue encontrada.",
                    pregunta_id: body.pregunta_id
                })
            };
        }

        // Respuesta exitosa
        return {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: "El registro fue actualizado exitosamente.",
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