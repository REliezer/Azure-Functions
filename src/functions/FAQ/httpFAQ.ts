import { app, HttpRequest, HttpResponseInit, InvocationContext, output, StorageQueueOutput } from "@azure/functions";
import { getDbConnection } from "../dbConnection";

const sendToQueue: StorageQueueOutput = output.storageQueue({
    queueName: 'outqueue',
    connection: 'AzureWebJobsStorage',
});

export async function getFAQ(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);
        let pool = await getDbConnection();
        context.log("Connected to database");        

        // Obtiene las preguntas frecuentes
        let result = await pool.request().query("SELECT * FROM preguntas_frecuentes");
        context.log("Consulta ejecutada con éxito");

        let responseData = {
            preguntas: result.recordset
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

app.http('getFAQ', {
    methods: ['GET'],
    extraOutputs: [sendToQueue],
    authLevel: 'anonymous',
    handler: getFAQ,
});
