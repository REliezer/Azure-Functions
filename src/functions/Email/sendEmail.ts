import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { AuthorizationCodeCredential } from "@azure/identity";

// Función para enviar correos
export async function sendEmail(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log("Procesando solicitud para enviar correo...");

    // Obtener datos del body
    const body = await req.json() as { correo: string, authCode: string, pdfURL: string };
    console.log('correo: ', body.correo)
    console.log('authCode: ', body.authCode)
    console.log('pdfURL: ', body.pdfURL)

    if (!body.correo || !body.authCode || !body.pdfURL) {
        return { status: 400, body: "Correo, código de autorización y URL del PDF son obligatorios." };
    }

    try {
        // Autenticación con Microsoft Graph API usando el flujo delegado
        const credential = new AuthorizationCodeCredential(
            process.env.TENANT_ID || '',
            process.env.CLIENT_ID || '',
            process.env.CLIENT_SECRET || '',
            body.authCode, // Código de autorización obtenido del flujo de OAuth
            "http://localhost:5173/dashboard/administrador" // Redirect URI registrado en Azure AD
        );

        const authProvider = new TokenCredentialAuthenticationProvider(credential, {
            scopes: ["Mail.Send"],
        });

        const client = Client.initWithMiddleware({
            authProvider: authProvider,
        });

        // Crear el mensaje de correo
        const message = {
            subject: "Reporte en PDF",
            body: {
                contentType: "HTML", // Usamos HTML para incluir un enlace
                content: `
                    <p>Hola,</p>
                    <p>Adjunto encontrarás el enlace para descargar el reporte en PDF:</p>
                    <p><a href="${body.pdfURL}">Descargar PDF</a></p>
                    <p>Saludos,</p>
                `,
            },
            toRecipients: [
                {
                    emailAddress: {
                        address: body.correo,
                    },
                },
            ],
        };

        // Enviar el correo
        await client.api("/me/sendMail").post({
            message: message,
            saveToSentItems: false, // Opcional: Guardar el correo en la carpeta "Enviados"
        });

        return { 
            status: 200, 
            body: JSON.stringify({ error: "Correo enviado correctamente." })};
    } catch (error: any) {
        context.log("Error enviando correo:", error);
        return { 
            status: 500, 
            body: JSON.stringify({error: `Error al enviar el correo: ${error.message}` }) };
    }
}