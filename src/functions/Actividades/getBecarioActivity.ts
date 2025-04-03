import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";

export async function getBecarioActivity(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        
        context.log(`Http function processed request for url "${request.url}"`);
        
        const body = await request.json() as {
            centro_id: number;            
        };

        if (!body.centro_id ) {
            return {
                status: 400,
                body: JSON.stringify("Falta el parámetro 'centro_id'.")
            };
        }

        let pool = await getDbConnection();
        context.log("Connected to database");

        let result = await pool.request()
            .execute("getBecarioActivities");
        context.log("Consulta ejecutada con éxito");

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
        context.log(`Error: ${error}`);
        return {
            status: 500,
            body: 'Internal Server Error'
        };
    }
};


