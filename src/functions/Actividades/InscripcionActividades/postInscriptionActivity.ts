import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../../dbConnection";
import * as sql from "mssql";

export async function postInscriptionActivity(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const customErrors = [50000, 50001, 50002, 50003];

    try {
        context.log(`Http function processed request for url "${request.url}"`);

        const body = await request.json() as {
            actividad_id: string;
            no_cuenta: string
        };

        // Validar datos de entrada
        if (!body.actividad_id || !body.no_cuenta) {
            return {
                status: 400,
                body: JSON.stringify({ error: "Todos los campos son obligatorios." })
            };
        }

        let pool = await getDbConnection();
        context.log("Connected to database");

        // Ejecutar el procedimiento almacenado
        let result = await pool.request()
            .input("actividad_id", sql.VarChar, body.actividad_id)
            .input("no_cuenta", sql.NVarChar, body.no_cuenta)
            .execute("insert_nueva_inscripcion_act");

        if (result.rowsAffected[0] === 0) {
            return { status: 404, body: "Fallo la inscripción en la actividad." };
        }

        return { status: 200, body: JSON.stringify({ message: "Inscripcion a la actividad exitosamente." })};
    } catch (error) {        
        if (error instanceof sql.RequestError && typeof error.number === "number" && customErrors.includes(error.number)) {
            context.log(`Error personalizado: ${error.message}`);
            return {
                status: 400,
                body: JSON.stringify({ error: error.message })
            };
        } else {
            context.log(`Error desconocido: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
            return {
                status: 500,
                body: JSON.stringify({ error: 'Internal Server Error' })
            };
        }
    }
};


