import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";
import * as bcrypt from "bcryptjs";

const isStudent = (email: string) =>
    /^[A-Z0-9._%+-]+@(unah\.hn)$/i.test(email);

export async function changePassword(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const body = await request.json() as { email?: string; newPass?: string; };

        if (!body.email || !body.newPass) {
            return { status: 400, body: 'El campo email y newPass son requeridos' };
        }

        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }

        // Obtener la persona_id
        let result = await pool.request()
            .input("correoInstitucional", sql.NVarChar, body.email)
            .query("SELECT persona_id FROM persona WHERE correo_institucional = @correoInstitucional");

        if (result.recordset.length === 0) {
            return { 
                status: 404,
                body: JSON.stringify({body: 'No se encontró a ningun becario o empleado.', status: false}),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        let personId = result.recordset[0].persona_id;

        const plainPassword = body.newPass;
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        if (!isStudent(body.email)) {
            console.log('Eres empleado.')
            //Set employees contrasena
            let updateResult = await pool.request()
                .input("hashedPassword", sql.NChar, hashedPassword)
                .query(`UPDATE empleado SET contrasena = @hashedPassword WHERE persona_id = ${personId}`);

            if (updateResult.rowsAffected[0] === 0) {
                return { 
                    status: 500,
                    body: JSON.stringify({body: 'No se pudo actualizar contrasena', status: false}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            }
        } else {
            console.log('Eres Estudiante')
            //Set becario contrasena
            let updateResult = await pool.request()
                .input("hashedPassword", sql.NChar, hashedPassword)
                .query(`UPDATE becario SET contrasena = @hashedPassword WHERE persona_id = ${personId}`);

            if (updateResult.rowsAffected[0] === 0) {
                return { status: 500, body: 'No se pudo actualizar contrasena' };
            }
        }

        return { 
            status: 200,
            body: JSON.stringify({body: 'Contraseña cambiado con exito.', status: true}),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        context.log(`Error: ${error}`);
        return { 
            status: 500,
            body: JSON.stringify({body: 'Internal Server Error', status: false}),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};

