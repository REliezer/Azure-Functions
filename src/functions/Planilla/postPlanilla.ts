import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import { authMiddleware } from "../auth/authMiddleware";
import * as sql from "mssql";
import { PlanillaValidator } from "./ValidacionesPlanilla/PlanillaValidatorBody";

export async function postPlanilla(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const authResponse = await authMiddleware(request, context, [1, 3]);
        if (authResponse) return authResponse;

        context.log(`Http function processed request for url "${request.url}"`);
        
        const body = await request.json() as {
            mes: string;
            anio: number;   
            centro_estudio_id: number;
            empleado_id: string;
        };

        const validationResult = PlanillaValidator.validate(body);
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
            .input("mes", sql.NVarChar, body.mes)
            .input("anio", sql.Int, body.anio) 
            .input("centro_estudio_id", sql.Int, body.centro_estudio_id)
            .input("empleado_id", sql.NVarChar, body.empleado_id)
            .execute("sp_insertar_planilla");

        // Verificar si se insertó correctamente y extraer el planilla_id o mensaje
        const planillaId = result.recordset[0].planilla_id;
        const message = result.recordset[0].message || "Planilla Creada exitosamente.";
        
        if (planillaId === 0) {
            return {
                status: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: message
                })
            };
        }
        return {
            status: 201,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: message,
                planilla_id: planillaId
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
