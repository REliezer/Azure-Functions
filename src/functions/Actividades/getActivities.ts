import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";

export async function getActivities(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);
        let pool = await getDbConnection();
        context.log("Connected to database");

        let result = await pool.request()
            .execute("GetAllActividades");

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


