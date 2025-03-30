import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import { authMiddleware } from "../auth/authMiddleware";
import * as sql from "mssql";
import { FaqValidator } from "./ValidacionesPreguntas/FAQValidatorBody";

export async function postFaq(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const authResponse = await authMiddleware(request, context, [1, 3]);
        if (authResponse) return authResponse;

        context.log(`Http function processed request for url "${request.url}"`);

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

        let pool = await getDbConnection();
        context.log("Connected to database");

        let result = await pool.request()
            .input("pregunta", sql.NVarChar, body.pregunta)
            .input("respuesta", sql.NVarChar, body.respuesta)
            .execute("sp_preguntasFrecuentes");

        return {
            status: 201,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "La pregunta fue Creada exitosamente.",
                data: result
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
