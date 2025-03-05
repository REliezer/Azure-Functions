import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";

export async function getComunicados(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);
        
        let pool = await getDbConnection();
        context.log("Connected to database");        

        // Ejecutamos el procedimiento almacenado para obtener todos los comunicados
        let result = await pool.request().execute("GetAllComunicados");

        if (!result || !result.recordset) {
            throw new Error("Error al obtener los datos de la base de datos");
        }

        context.log("Consulta ejecutada con éxito");

        // Transformar los comunicados
        const transformedComunicados = result.recordset.reduce((acc, comunicado) => {
            const key = comunicado.categoria_afiche_id;
            
            if (!acc[key]) {
                acc[key] = [];
            }
            
            acc[key].push({
                nombre_afiche: comunicado.nombre_afiche,
                fecha_actividad: comunicado.fecha_actividad,
                url_afiche: comunicado.url_afiche,
                nombre_categoria: comunicado.nombre_categoria


            });
            
            return acc;
        }, {});

        return {
            status: 200,
            body: JSON.stringify(transformedComunicados),
            headers: { "Content-Type": "application/json" }
        };

    } catch (error: any) {
        context.log(`Error: ${error.message}`);
        return {
            status: 500,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
            headers: { "Content-Type": "application/json" }
        };
    }
};