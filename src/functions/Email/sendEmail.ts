import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as dotenv from "dotenv";
import * as nodemailer from "nodemailer";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";
import * as bcrypt from 'bcryptjs';
//import fetch from 'node-fetch';

dotenv.config();

export async function sendEmail(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log("Procesando solicitud para enviar correo...");

    // Validar parámetros obligatorios
    const body = await req.json() as {
        persona_id: number;
        fromEmail: string;
        toEmail: string;
        pdfURL?: string;
        subject: string;
        bodyMessage: string;
        contrasena:string;
    };

    if (!body.fromEmail || !body.toEmail || !body.pdfURL || !body.subject || !body.bodyMessage || !body.contrasena) {
        return { status: 400, body: "Faltan parámetros obligatorios." };
    }

    let pool = await getDbConnection();
    if (!pool) {
        return { status: 500, body: 'No se pudo conectar a la base de datos' };
    }

    try {
        // Llamamos al procedimiento almacenado para obtener la contraseña desde la base de datos
        let result = await pool.request()
            .input("correo", sql.NVarChar, body.fromEmail)
            .input("persona_id", sql.Numeric, body.persona_id)

            .execute("SP_SEL_MEDIANTECORREOEMPLEADO");

        if (result.recordset.length === 0) {
            return { status: 404, body: "No se encontró el remitente." };
        }

        const password = result.recordset[0].contrasena;       

        const isMatch = await body.contrasena == password
                if (!isMatch) {
                    return {
                        status: 401,
                        body: JSON.stringify({ employee: 'Usuario sin Permisos (sus contraseña no coincide)', status: false }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };
                }
                    // Crear el transporte con la contraseña obtenida
                    const transporter = nodemailer.createTransport({
                        host: "smtp.office365.com",
                        port: 587,
                        secure: false,
                        //service: 'Outlook',
                        auth: {
                            user: process.env.CORREO,
                            pass: process.env.PASSWORD,
                        },
                    });

        // Descargar el PDF y convertirlo en un archivo adjunto
        const pdfBuffer = Buffer.from(await fetch(body.pdfURL).then(res => res.arrayBuffer()));

        // Configurar el correo con los parámetros necesarios
        const mailOptions = {
            from: process.env.CORREO,
            to: body.toEmail,
            subject: body.subject,
            text: body.bodyMessage,
            attachments: [
                {
                    filename: 'reporte.pdf',
                    content: pdfBuffer,
                    encoding: 'base64',
                },
            ],
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);

        // Retornar respuesta de éxito
        return { 
            status: 200, 
            body: JSON.stringify({ message: "Correo enviado correctamente."})
        };
    } catch (error: any) {
        context.log("Error al enviar correo:", error);
        return { 
            status: 404,
             
            body: JSON.stringify({ error: `Error al enviar el correo: ${error.message}`}) 
        };
    }
}