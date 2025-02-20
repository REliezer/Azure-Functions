import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";
import * as bcrypt from "bcryptjs";

export async function encryptPasswordsEmployees(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log("Iniciando encriptación de contraseñas...");

        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }

        // Obtener todas las contraseñas sin encriptar
        let result = await pool.request().query("SELECT empleado_id, contrasena FROM empleado");

        for (const row of result.recordset) {
            const empleadoId = row.empleado_id;
            const plainPassword = row.contrasena;

            // Verificar si ya está encriptada (bcrypt empieza con $2b$ o $2a$)
            if (plainPassword.startsWith("$2b$") || plainPassword.startsWith("$2a$")) {
                context.log(`La contraseña del empleado ${empleadoId} ya está encriptada. Omitiendo...`);
                continue;
            }

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            // Actualizar la base de datos con la contraseña encriptada
            await pool.request()
                .input("hashedPassword", sql.NVarChar, hashedPassword)
                .input("empleadoId", sql.NVarChar, empleadoId)
                .query("UPDATE empleado SET contrasena = @hashedPassword WHERE empleado_id = @empleadoId");

            context.log(`Contraseña encriptada para empleado_id: ${empleadoId}`);
        }

        return { body: 'Todas las contraseñas han sido encriptadas correctamente.' };
    } catch (error) {
        context.log(`Error: ${error}`);
        return { status: 500, body: 'Internal Server Error' };
    }
};

