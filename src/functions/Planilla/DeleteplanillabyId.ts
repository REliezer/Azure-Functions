import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import { authMiddleware } from "../auth/authMiddleware";

export async function Deleteplanilla_Id(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        const authResponse = await authMiddleware(request, context, [1, 3]);
        if (authResponse) return authResponse;

        const body = await request.json() as { empleado_id: string, planilla_id: number };
        const empleado_id = body.empleado_id;
        const planilla_id = body.planilla_id;

        if (!empleado_id || !planilla_id) {
            return {
                status: 400,
                body: 'Faltan parámetros: empleado_id o Deleteplanilla_Id.'
            };
        }

        let pool = await getDbConnection();
        context.log("Connected to database");

        let result = await pool.request()
            .input('planilla_id', planilla_id)
            .input('empleado_id', empleado_id)
            .execute("DeletePlanilla");

        if (result.rowsAffected[0] === 0) {
            return {
                status: 404,
                body: 'La planilla no fue encontrada o no pudo ser eliminada.'
            };
        }

        return {
            status: 200,
            body: 'La planilla fue eliminada exitosamente.'
        };

    } catch (error) {
        context.log(`Error: ${error}`);
        return {
            status: 500,
            body: 'Internal Server Error'
        };
    }
};
