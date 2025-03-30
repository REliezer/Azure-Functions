import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";
import * as bcrypt from "bcryptjs";
const jwt = require('jsonwebtoken');

export async function loginBecario(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const body = await request.json() as { no_cuenta?: string; contrasena?: string };

        if (!body.no_cuenta || !body.contrasena) {
            return { status: 400, body: 'El campo no_cuenta y la contraseña son requeridos' };
        }

        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }

        // Obtener el becario con la contraseña encriptada
        let result = await pool.request()
            .input("noCuenta", sql.NVarChar, body.no_cuenta)
            .query("SELECT * FROM becario WHERE no_cuenta = @noCuenta");

        if (result.recordset.length === 0) {
            return {
                status: 404,
                body: JSON.stringify({becario: 'No se encontró el becario', status: false}),                
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
                body: JSON.stringify({becario: 'Contraseña incorrecta', status: false}),                
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
                becario_id: result.recordset[0].becario_id, 
                persona_id: result.recordset[0].persona_id,
                no_cuenta: result.recordset[0].no_cuenta,
                carrera_id: result.recordset[0].carrera_id,
                beca_id: result.recordset[0].beca_id,
                estado_beca_id: result.recordset[0].estado_beca_id,
                fecha_inicio_beca: result.recordset[0].fecha_inicio_beca,
                centro_estudio_id: result.recordset[0].centro_estudio_id,
                rol: 'becario'
            },
            process.env.JWT_SECRET!,
            { 
                expiresIn: process.env.JWT_EXPIRES_IN 
            }
        );

        const expires = new Date();
        expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días

        // Actualizar último acceso
        const lastAccessUpdate = new Date();
        let updateResult = await pool.request()
            .input("noCuenta", sql.NVarChar, body.no_cuenta)
            .input("lastAccessUpdate", sql.DateTime, lastAccessUpdate)
            .query("UPDATE becario SET ultimo_acceso = @lastAccessUpdate WHERE no_cuenta = @noCuenta");

        if (updateResult.rowsAffected[0] === 0) {
            return { status: 500, body: 'No se pudo actualizar ultimo_acceso' };
        }

        return { 
            status: 200,
            body: JSON.stringify({ token, status: true }),
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': `token=${token}; HttpOnly; SameSite=Strict; Expires=${expires.toUTCString()}; Path=/`
            }
        };
        
    } catch (error) {
        context.log(`Error: ${error}`);
        return { status: 500, body: 'Internal Server Error' };
    }
};

