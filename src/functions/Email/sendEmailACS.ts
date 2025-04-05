import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { EmailClient, EmailMessage } from "@azure/communication-email";
import { authMiddleware } from "../auth/authMiddleware";
import * as fs from "fs";
import fetch from "node-fetch"; // Para descargar archivos remotos

export async function sendEmailACS(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const authResponse = await authMiddleware(request, context, [1, 3]);
        if (authResponse) return authResponse;

        // Obtener la conexión de ACS desde variables de entorno
        const connectionString = process.env.ACS_CONNECTION_STRING;
        if (!connectionString) throw new Error("La variable de entorno ACS_CONNECTION_STRING no está configurada.");

        const emailClient = new EmailClient(connectionString);

        // Obtener datos del body
        const body = await request.json() as {
            to: string,
            subject: string,
            body: string,
            attachments?: { name: string, content: string, contentType: string }[]
        };

        if (!body.to || !body.subject || !body.body) {
            return { status: 400, body: "Faltan datos obligatorios (to, subject, body)" };
        }

        // Construcción del mensaje
        const message: EmailMessage = {
            senderAddress: "DoNotReply@1b151f55-32b4-4625-abf2-d2dd2d9e2224.azurecomm.net",
            recipients: {
                to: [
                    {
                        address: body.to,
                        displayName: "Proyecto IS802"
                    }
                ]
            },
            content: {
                subject: body.subject,
                plainText: body.body,
                html: `
			<html>
				<body>
                    <h1 style="text-align: center;">Plataforma Avanzada de Control Horas PASEE</h1>
                    <h2 style="text-align: center;">Reporte de seguimiento</h2>
                    <p style="font-size: 16px;">${body.body? body.body : "Hola,"}</p>
                    <p style="font-size: 16px;">Este es un correo automático enviado por la Plataforma Avanzada de Control Horas PASEE. Este correo es para informarte del reporte de seguimiento.</p>
                    <p style="font-size: 16px;">Adjunto encontrarás el reporte de seguimiento realizado, igualmente te enviamos el enlace para descargar el reporte en PDF por si no te llega el archivo:</p>
                    <p style="font-size: 16px;">Para ver el reporte de seguimiento, haga clic en el siguiente enlace:</p>
                    <p style="font-size: 16px;"><a style="background-color: #003b74; padding: 10px; color: #FBFCF8; border-radius: 5px; text-decoration: none;" href="${body.attachments?.[0]?.content || "#"}">Descargar PDF</a></p>
                    
                    <p style="font-size: 16px;">Saludos,</p>

                    <p style="font-size: 11px; font-style: italic;">El reporte de seguimiento se ha generado automaticamente desde laPlataforma Avanzada de Control Horas PASEE.</p>
				</body>
			</html>`,
            },
        };

        // Si hay archivos adjuntos, descargarlos si es una URL
        if (body.attachments && Array.isArray(body.attachments)) {
            message.attachments = await Promise.all(body.attachments.map(async (att) => {
                if (!att.name || !att.content || !att.contentType) {
                    throw new Error("Cada adjunto debe tener 'name', 'content' y 'contentType'.");
                }

                let fileContentBase64 = att.content;
                // Si es una URL, descargar el archivo y convertirlo a base64
                if (att.content.startsWith("https")) {
                    const response = await fetch(att.content);
                    if (!response.ok) throw new Error(`No se pudo descargar el archivo: ${att.content}`);
                    const buffer = await response.buffer();
                    fileContentBase64 = buffer.toString("base64");
                }
                // Si es un archivo local, leerlo
                else if (fs.existsSync(att.content)) {
                    fileContentBase64 = fs.readFileSync(att.content).toString("base64");
                }

                return {
                    name: att.name,
                    contentType: att.contentType,
                    contentInBase64: fileContentBase64
                };
            }));
        }

        // Enviar el correo
        const poller = await emailClient.beginSend(message);
        const result = await poller.pollUntilDone();

        return {
            status: 200,
            body: JSON.stringify({ messageId: result.id, status: "Correo enviado exitosamente" })
        };
    } catch (error: any) {
        return {
            status: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

