import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol, StorageSharedKeyCredential } from "@azure/storage-blob";

const accountName = "storageproject25";

export async function getSasToken( request: HttpRequest, context: InvocationContext ): Promise<HttpResponseInit> {
    context.log("Http function processed request for url 'getSasToken'");

    const accountKey = process.env.AZURE_STORAGE_KEY;
    if (!accountKey) {
        return {
            status: 500,
            jsonBody: { error: "AZURE_STORAGE_KEY no está definido en variables de entorno" }
        };
    }

    const body = await request.json() as {
        containerName: string;
        permissions: string;
        expiresInMinutes?: number;
    };

    if (!body.containerName || !body.permissions) {
        return {
            status: 400,
            body: JSON.stringify("Falta parametros obligatorios.")
        };
    }

    const durationMinutes = Math.min(body.expiresInMinutes ?? 20, 480);

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const startsOn = new Date();
    const expiresOn = new Date(startsOn.getTime() + durationMinutes * 60 * 1000);

    const sasToken = generateBlobSASQueryParameters({
        containerName: body.containerName,
        permissions: BlobSASPermissions.parse(body.permissions),
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https
    }, sharedKeyCredential).toString();

    const sasUrl = `https://${accountName}.blob.core.windows.net?${sasToken}`;

    return {
        status: 200,
        jsonBody: {
            sasToken,
            sasUrl
        }
    };
}
