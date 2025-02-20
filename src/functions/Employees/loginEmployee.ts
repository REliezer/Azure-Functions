import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";
import * as bcrypt from "bcrypt";

export async function loginEmployee(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const body = await request.json() as { no_empleado?: string; contrasena?: string };

        if (!body.no_empleado || !body.contrasena) {
            return { status: 400, body: 'El campo no_empleado y la contraseña son requeridos' };
        }

        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }

        // Obtener el becario con la contraseña encriptada
        let result = await pool.request()
            .input("noEmpleado", sql.NVarChar, body.no_empleado)
            .query("SELECT contrasena FROM empleado WHERE no_empleado = @noEmpleado");

        if (result.recordset.length === 0) {
            return { status: 404, body: 'No se encontró el empleado' };
        }

        const storedPassword = result.recordset[0].contrasena;
        /*
        // Comparar la contraseña ingresada con la encriptada
        const isMatch = await bcrypt.compare(body.contrasena, storedPassword);
        if (!isMatch) {
            return { status: 401, body: 'Contraseña incorrecta' };
        }
        */
        if (body.contrasena != storedPassword) {
            return { status: 401, body: 'Contraseña incorrecta' };
        }
        return { status: 200, body: 'Login exitoso' };
    } catch (error) {
        context.log(`Error: ${error}`);
        return { status: 500, body: 'Internal Server Error' };
    }
};

