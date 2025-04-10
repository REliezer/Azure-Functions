import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

export async function informacionPlanillabyId(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        // Obtener el parámetro desde la URL
        const planillaIdParam = request.params.planilla_id;
        const planillaId = parseInt(planillaIdParam, 10);

        // Validación
        if (isNaN(planillaId) || planillaId <= 0) {
            return {
                status: 400,
                body: JSON.stringify({ error: "'planilla_id' debe ser un número entero positivo." }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Conexión a la base de datos
        const pool = await getDbConnection();
        context.log("Conexión a base de datos exitosa");

        const result = await pool.request()
            .input("planilla_id", sql.Int, planillaId)
            .execute("SEL_planillaById");

        context.log("Consulta ejecutada con éxito");

        // Validación del resultado
        if (result.recordset.length === 0) {
            return {
                status: 404,
                body: JSON.stringify({ error: "No se encontró la planilla con ese ID." }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Respuesta exitosa
        const responseData = {
            planillas: result.recordset
        };

        return {
            status: 200,
            body: JSON.stringify(responseData),
            headers: {
                'Content-Type': 'application/json'
            }
        };

    } catch (error) {
        context.log(`Error al obtener información de la planilla: ${error}`);
        return {
            status: 500,
            body: JSON.stringify({ error: "Error interno del servidor al consultar la planilla." }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};
