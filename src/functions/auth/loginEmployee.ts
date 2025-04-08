import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";
import * as bcrypt from "bcryptjs";
const jwt = require('jsonwebtoken');

export async function loginEmployee(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        if (request.method === 'OPTIONS') {
            return {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie'
                }
            };
        }
        
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

        // Generar el refresh token (válido por más tiempo)
        const refreshToken = jwt.sign(
            {
                empleado_id: result.recordset[0].empleado_id,
                persona_id: result.recordset[0].persona_id,
                no_empleado: result.recordset[0].no_empleado,
                centro_id: result.recordset[0].centro_id,
                rol: 'admin',
                role_level: result.recordset[0].rol_id,
                tipo: 'refresh'
            },
            process.env.JWT_REFRESH_SECRET!,
            {
                expiresIn: '7d'
            }
        );

        // Calcular la fecha de expiración para Set-Cookie (7 días)
        const expires = new Date();
        expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);

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
            body: JSON.stringify({ token, refreshToken, status: true }),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Credentials": "true",
                //Pruebas
                //'Set-Cookie': `refreshToken=${refreshToken}; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}; Path=/`
                //Deploy
                'Set-Cookie': `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=None; Expires=${expires.toUTCString()}; Path=/`
            }
        };
    } catch (error) {
        context.log(`Error: ${error}`);
        return { status: 500, body: 'Internal Server Error' };
    }
};

