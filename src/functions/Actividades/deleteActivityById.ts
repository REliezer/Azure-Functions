import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import { authMiddleware } from "../auth/authMiddleware";

export async function deleteActivityById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        const authResponse = await authMiddleware(request, context, [1, 3]);
        if (authResponse) return authResponse;

        const body = await request.json() as { empleado_id: string, actividad_id: string };
        const empleado_id = body.empleado_id;
        const actividad_id = body.actividad_id;

        if (!empleado_id || !actividad_id) {
            return {
                status: 400,
                body: 'Faltan parámetros: empleado_id o actividad_id.'
            };
        }

        let pool = await getDbConnection();
        context.log("Connected to database");

        let result = await pool.request()
            .input('actividad_id', actividad_id)
            .input('empleado_id', empleado_id)
            .execute("DeleteActividad");

        if (result.rowsAffected[0] === 0) {
            return {
                status: 404,
                body: 'La actividad no fue encontrada o no pudo ser eliminada.'
            };
        }

        return {
            status: 200,
            body: 'La actividad fue eliminada exitosamente.'
        };

    } catch (error) {
        context.log(`Error: ${error}`);
        return {
            status: 500,
            body: 'Internal Server Error'
        };
    }
};
