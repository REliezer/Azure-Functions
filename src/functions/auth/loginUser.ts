import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";
import * as bcrypt from "bcryptjs";

export async function loginUser(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);
    try {
        const body = await request.json() as { no_cuenta?: string; no_empleado?: string; contrasena: string };

        if ((!body.no_cuenta && !body.no_empleado) || !body.contrasena) {
            return { status: 400, body: 'El campo no_cuenta o no_empleado y la contraseña son requeridos' };
        }

        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }

        if (body.no_cuenta) {
            console.log('Eres Estudiante.')
            // Obtener el becario con la contraseña encriptada
            let result = await pool.request()
                .input("noCuenta", sql.NVarChar, body.no_cuenta)
                .query("SELECT contrasena FROM becario WHERE no_cuenta = @noCuenta");

            if (result.recordset.length === 0) {
                return { status: 404, body: 'No se encontró el becario' };
            }

            const storedPassword = result.recordset[0].contrasena;

            // Comparar la contraseña ingresada con la encriptada
            const isMatch = await bcrypt.compare(body.contrasena, storedPassword);
            if (!isMatch) {
                return { status: 401, body: 'Contraseña incorrecta' };
            }

            // Actualizar último acceso
            const lastAccessUpdate = new Date(); // Fecha y hora actual
            let updateResult = await pool.request()
                .input("noCuenta", sql.NVarChar, body.no_cuenta)
                .input("lastAccessUpdate", sql.DateTime, lastAccessUpdate)
                .query("UPDATE becario SET ultimo_acceso = @lastAccessUpdate WHERE no_cuenta = @noCuenta");

            if (updateResult.rowsAffected[0] === 0) {
                return { status: 500, body: 'No se pudo actualizar ultimo_acceso' };
            }
        } else if (body.no_empleado) {
            console.log('Eres Empleado')
            // Obtener el empleado con la contraseña encriptada
            let result = await pool.request()
                .input("noEmpleado", sql.NVarChar, body.no_empleado)
                .query("SELECT contrasena FROM empleado WHERE no_empleado = @noEmpleado");

            if (result.recordset.length === 0) {
                return { status: 404, body: 'No se encontró el empleado' };
            }

            const storedPassword = result.recordset[0].contrasena;

            // Comparar la contraseña ingresada con la encriptada
            const isMatch = await bcrypt.compare(body.contrasena, storedPassword);
            if (!isMatch) {
                return { status: 401, body: 'Contraseña incorrecta' };
            }

            // Actualizar último acceso
            const lastAccessUpdate = new Date(); // Fecha y hora actual
            let updateResult = await pool.request()
                .input("noEmpleado", sql.NVarChar, body.no_empleado)
                .input("lastAccessUpdate", sql.DateTime, lastAccessUpdate)
                .query("UPDATE empleado SET ultimo_acceso = @lastAccessUpdate WHERE no_empleado = @noEmpleado");

            if (updateResult.rowsAffected[0] === 0) {
                return { status: 500, body: 'No se pudo actualizar ultimo_acceso' };
            }
        } else {
            return { status: 500, body: 'Error credenciales no reconocidas.' };
        }

        return { status: 200, body: 'Login exitoso y actualizado su ultimo acceso.' };
    } catch (error) {
        context.log(`Error: ${error}`);
        return { status: 500, body: 'Internal Server Error' };
    }
};


