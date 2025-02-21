import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";
import * as bcrypt from "bcryptjs";

export async function encryptPasswords(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log("Iniciando encriptación de contraseñas...");

        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }

        // Obtener todas las contraseñas sin encriptar
        let result = await pool.request().query("SELECT becario_id, contrasena FROM becario");

        for (const row of result.recordset) {
            const becarioId = row.becario_id;
            const plainPassword = row.contrasena;

            // Verificar si ya está encriptada (bcrypt empieza con $2b$ o $2a$)
            if (plainPassword.startsWith("$2b$") || plainPassword.startsWith("$2a$")) {
                context.log(`La contraseña del becario ${becarioId} ya está encriptada. Omitiendo...`);
                continue;
            }

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            // Actualizar la base de datos con la contraseña encriptada
            await pool.request()
                .input("hashedPassword", sql.NVarChar, hashedPassword)
                .input("becarioId", sql.NVarChar, becarioId)
                .query("UPDATE becario SET contrasena = @hashedPassword WHERE becario_id = @becarioId");

            context.log(`Contraseña encriptada para becario_id: ${becarioId}`);
        }

        return { body: 'Todas las contraseñas han sido encriptadas correctamente.' };
    } catch (error) {
        context.log(`Error: ${error}`);
        return { status: 500, body: 'Internal Server Error' };
    }
};

