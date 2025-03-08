import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../../dbConnection";
import * as sql from "mssql";

export async function postInscriptionActivity(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        const body = await request.json() as {
            actividad_id: string;
            no_cuenta: string
        };

        let pool = await getDbConnection();
        context.log("Connected to database");

        // Ejecutar el procedimiento almacenado
        let result = await pool.request()
            .input("actividad_id", sql.VarChar, body.actividad_id)
            .input("no_cuenta", sql.NVarChar, body.no_cuenta)
            .execute("insert_nueva_inscripcion_act");  // Llamamos al procedimiento almacenado

        if (result.rowsAffected[0] === 0) {
            return { status: 404, body: "Fallo la inscripción en la actividad." };
        }

        return { status: 200, body: JSON.stringify({ message: "Inscripcion a la actividad exitosamente." })};
    } catch (error) {        
        if (error instanceof sql.RequestError && (error.number === 50000 || error.number === 50001)) {
            context.log(`Error personalizado: ${error.message}`);
            return {
                status: 400,
                body: JSON.stringify({ error: error.message })
            };
        } else {
            context.log(`Error: ${error}`);
            return {
                status: 500,
                body: JSON.stringify({ error: 'Internal Server Error' })
            };
        }
    }
};


