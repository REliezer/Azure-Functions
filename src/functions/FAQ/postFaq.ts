import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";
import { FaqValidator } from "./ValidacionesPreguntas/FAQValidatorBody";

export async function postFaq(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        // Parsear el cuerpo de la solicitud
        const body = await request.json() as {
            pregunta: string;
            respuesta: string;   
        };

        // Validar los datos de entrada usando el validador
        const validationResult = FaqValidator.validate(body);
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
            .input("pregunta", sql.NVarChar, body.pregunta)
            .input("respuesta", sql.NVarChar, body.respuesta)
            .execute("sp_preguntasFrecuentes");

           
        // Respuesta exitosa
        return {
            status: 201,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "La pregunta fue Creada exitosamente.",
                data: result // Opcional: incluir datos adicionales
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
