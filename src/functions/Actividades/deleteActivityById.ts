import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";

export async function deleteActivityById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);

        // Obtenemos los parámetros de la solicitud (empleado_id y actividad_id)
        const empleado_id = request.query.get('empleado_id');
        const actividad_id = request.query.get('actividad_id');

        if (!empleado_id || !actividad_id) {
            return {
                status: 400,
                body: 'Faltan parámetros: empleado_id o actividad_id.'
            };
        }

        let pool = await getDbConnection();
        context.log("Connected to database");

        // Ejecutamos el procedimiento almacenado para eliminar la actividad
        let result = await pool.request()
            .input('actividad_id', actividad_id)
            .input('empleado_id', empleado_id)
            .execute("DeleteActividad");  // Llamamos al procedimiento almacenado para eliminar la actividad

        // En este caso, el procedimiento almacenado ya maneja la verificación de permisos y eliminación
        // Si la actividad no fue eliminada, la respuesta será un mensaje
        if (result.rowsAffected[0] === 0) {
            return {
                status: 404,
                body: 'La actividad no fue encontrada o no pudo ser eliminada.'
            };
        }

        // Si la actividad fue eliminada, la respuesta será un mensaje de éxito
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
