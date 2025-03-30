import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";
import * as bcrypt from "bcryptjs";
const jwt = require('jsonwebtoken');

export async function loginEmployee(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const body = await request.json() as { no_empleado?: string; contrasena?: string };

        if (!body.no_empleado || !body.contrasena) {
            return { status: 400, body: JSON.stringify({ error: 'El campo no_empleado y la contraseña son requeridos' }) };
        }

        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: JSON.stringify({ error: 'No se pudo conectar a la base de datos' }) };
        }

        let result = await pool.request()
            .input("noEmpleado", sql.NVarChar, body.no_empleado)
            .query("SELECT * FROM empleado WHERE no_empleado = @noEmpleado");

        if (result.recordset.length === 0) {
            return {
                status: 404,
                body: JSON.stringify({ employee: 'No se encontró el empleado', status: false }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        const storedPassword = result.recordset[0].contrasena;
        const isMatch = await bcrypt.compare(body.contrasena, storedPassword);

        if (!isMatch) {
            return {
                status: 401,
                body: JSON.stringify({ employee: 'Contraseña incorrecta', status: false }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Verificar que las variables de entorno existen
        if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
            throw new Error("JWT_SECRET o JWT_EXPIRES_IN no están definidos en las variables de entorno");
        }
        
        // Generar token JWT
        const token = jwt.sign(
            {
                empleado_id: result.recordset[0].empleado_id,
                persona_id: result.recordset[0].persona_id,
                no_empleado: result.recordset[0].no_empleado,
                centro_id: result.recordset[0].centro_id,
                rol: 'admin',
                role_level: result.recordset[0].rol_id
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        // Calcular la fecha de expiración para Set-Cookie (7 días)
        const expires = new Date();
        expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días

        // Actualizar último acceso
        const lastAccessUpdate = new Date();
        let updateResult = await pool.request()
            .input("noEmpleado", sql.NVarChar, body.no_empleado)
            .input("lastAccessUpdate", sql.DateTime, lastAccessUpdate)
            .query("UPDATE empleado SET ultimo_acceso = @lastAccessUpdate WHERE no_empleado = @noEmpleado");

        if (updateResult.rowsAffected[0] === 0) {
            return { status: 500, body: 'No se pudo actualizar ultimo_acceso' };
        }

        return {
            status: 200,
            body: JSON.stringify({ token, status: true }),
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': `token=${token}; HttpOnly; Secure; SameSite=Strict; Expires=${expires.toUTCString()}; Path=/`
            }
        };
    } catch (error) {
        context.log(`Error: ${error}`);
        return { status: 500, body: 'Internal Server Error' };
    }
};

