import { InvocationContext, Timer } from "@azure/functions";
import { getDbConnection } from "../dbConnection";

export async function timerTriggerEstadoActividad(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('Timer function processed request.');

    let pool;
    try {
        pool = await getDbConnection();
        await pool.request().execute("sp_actualizar_estado_actividad");
        context.log("Estado de actividades actualizado correctamente.");
    } catch (error) {
        context.error("Error al actualizar el estado de la actividad:", error);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}


