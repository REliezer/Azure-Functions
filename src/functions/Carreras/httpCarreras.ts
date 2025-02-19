import { app, HttpRequest, HttpResponseInit, InvocationContext, output, StorageQueueOutput } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

const sendToQueue: StorageQueueOutput = output.storageQueue({
    queueName: 'outqueue',
    connection: 'AzureWebJobsStorage',
});

export async function getCareerById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        let carrera_id: string | undefined;
        try {
            const body = await request.json() as { carrera_id?: string };
            carrera_id = body.carrera_id;
            if (!carrera_id) {
                return { status: 400, body: 'El campo carrera_id es requerido' };
            }
        } catch (error) {
            return { status: 400, body: 'Solicitud inválida, se esperaba un JSON' };
        }

        context.log(`Received carrera_id: ${carrera_id}`);

        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }
        context.log("Connected to database");

        // Obtiene el nombre de una carrera segun id
        let result = await pool.request()
            .input('carreraId', sql.NChar, carrera_id)
            .query("SELECT nombre_carrera FROM carreras WHERE carrera_id = @carreraId");
        context.log("Consulta ejecutada con éxito");

        // Obtener el nombre de la carrera como una cadena
        let nombreCarrera = result.recordset.length > 0 ? result.recordset[0].nombre_carrera : 'Carrera no encontrada';

        return {
            body: nombreCarrera, // Devolver solo el nombre de la carrera
            headers: {
                'Content-Type': 'text/plain'
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

app.http('getCareerById', {
    methods: ['POST'],
    extraOutputs: [sendToQueue],
    authLevel: 'anonymous',
    handler: getCareerById,
});
