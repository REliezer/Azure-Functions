import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";
import * as bcrypt from "bcryptjs";

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

        // Comparar la contraseña ingresada con la encriptada
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

        // Actualizar último acceso
        const lastAccessUpdate = new Date(); // Fecha y hora actual
        let updateResult = await pool.request()
            .input("noCuenta", sql.NVarChar, body.no_cuenta)
            .input("lastAccessUpdate", sql.DateTime, lastAccessUpdate)
            .query("UPDATE becario SET ultimo_acceso = @lastAccessUpdate WHERE no_cuenta = @noCuenta");

        if (updateResult.rowsAffected[0] === 0) {
            return { status: 500, body: 'No se pudo actualizar ultimo_acceso' };
        }

        return { 
            status: 200,
            body: JSON.stringify({becario: result.recordset[0], status: true}),
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
    } catch (error) {
        context.log(`Error: ${error}`);
        return { status: 500, body: 'Internal Server Error' };
    }
};

