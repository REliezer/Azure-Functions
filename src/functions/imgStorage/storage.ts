import * as dotenv from "dotenv";
dotenv.config();

import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
const containerName = "storageprojectunah";

export async function storage(req: HttpRequest): Promise<HttpResponseInit> {
    if (req.method !== "POST") {
        return { status: 405, body: "Método no permitido. Usa POST." };
    }

    try {
        const form = await req.formData();
        const formDataEntry = form.get("file"); // Obtener el archivo de FormData

        // Validar que es un archivo
        if (!formDataEntry || !(formDataEntry instanceof File)) {
            return { status: 400, body: "El archivo no es válido o no fue enviado." };
        }

        const file = formDataEntry;
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Verificar si el contenedor existe, y si no, crearlo
        if (!await containerClient.exists()) {
            await containerClient.create();
            console.log(`Contenedor "${containerName}" creado exitosamente.`);
        }

        const blobName = file.name; 
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Convertir archivo a buffer y subirlo
        const arrayBuffer = await file.arrayBuffer();
        await blockBlobClient.uploadData(Buffer.from(arrayBuffer), {
            blobHTTPHeaders: { blobContentType: file.type } // Usar el tipo MIME del archivo
        });

        return {
            status: 200,
            body: JSON.stringify({
                message: "Archivo subido exitosamente",
                blobUrl: blockBlobClient.url
            }),
        };
    } catch (error) {
        console.error("Error al subir archivo:", error);
        return { status: 500, body: "Error interno del servidor" };
    }
}