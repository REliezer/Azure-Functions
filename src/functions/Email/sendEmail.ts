import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";

// Función para enviar correos
export async function sendEmail(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log("Procesando solicitud para enviar correo...");

    // Obtener datos del body
    const body = await req.json() as { correo: string, cuerpo: string };

    if (!body.correo || !body.cuerpo) {
        return { status: 400, body: "Correo y cuerpo del mensaje son obligatorios." };
    }

    try {
        // Autenticación con Microsoft Graph API
        const credential = new ClientSecretCredential(
            process.env.TENANT_ID || "",
            process.env.CLIENT_ID || "",
            process.env.CLIENT_SECRET || ""
        );

        const token = await credential.getToken("https://graph.microsoft.com/.default");

        const client = Client.init({
            authProvider: (done) => done(null, token?.token || ""),
        });

        // Crear el mensaje de correo
        const message = {
            message: {
                subject: "Correo desde Azure Function con Microsoft Graph",
                body: { contentType: "Text", content: body.cuerpo },
                toRecipients: [{ emailAddress: { address: body.correo } }],
            },
        };

        // Enviar el correo
        await client.api("/me/sendMail").post(message);

        return { status: 200, body: "Correo enviado correctamente." };
    } catch (error: any) {
        //context.log.error("Error enviando correo:", error);
        return { status: 500, body: `Error al enviar el correo: ${error.message}` };
    }
}


