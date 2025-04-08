import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

    export async function getPlanillaByIdBecario(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {       
        let pool;
        try {
            context.log(`Http function processed request for url "${request.url}"`);
            pool = await getDbConnection();
        
            const becario_id = request.params.becario_id; // Accede al parámetro de la URL
            if (!becario_id) {
                return {
                    status: 400,
                    body: 'El campo becario_id es requerido en la URL!!'
                };
            }
        
            let result = await pool.request()
                .input("becario_id", sql.VarChar, becario_id)
                .execute("sp_planillaBecario");
        
            context.log("Consulta ejecutada con éxito");
        
            let responseData = {
                data: result.recordset
            };
        
            return {
                body: JSON.stringify(responseData),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        } catch (error) {
            context.log(`Error: ${error}`);
            return {
                status: 500,
                body: 'Error interno del servidor'
            };
        }
    };
    