import * as bcrypt from "bcrypt";
import { app, HttpRequest, HttpResponseInit, InvocationContext, output, StorageQueueOutput } from "@azure/functions";
import { getDbConnection } from "../dbConnection";
import * as sql from "mssql";

const sendToQueue: StorageQueueOutput = output.storageQueue({
    queueName: 'outqueue',
    connection: 'AzureWebJobsStorage',
});

export async function getAllBecarios(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);
        
        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }

        context.log("Connected to database");

        // Obtiene todos los becarios
        let result = await pool.request().query("SELECT * FROM becario");
        context.log("Consulta ejecutada con éxito");

        return {
            body: JSON.stringify({ becarios: result.recordset }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        context.log(`Error: ${error}`);
        return {
            status: 500,
            body: 'Internal Server Error'
        };
    }
};

app.http('getAllBecarios', {
    methods: ['GET'],
    extraOutputs: [sendToQueue],
    authLevel: 'anonymous',
    route: "becarios",
    handler: getAllBecarios,
});

export async function getBecarioNoCuenta(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log(`Http function processed request for url "${request.url}"`);
        
        let no_cuenta: string | undefined;
        try {
            const body = await request.json() as { no_cuenta?: string };
            no_cuenta = body.no_cuenta;
            if (!no_cuenta) {
                return { status: 400, body: 'El campo no_cuenta es requerido' };
            }
        } catch (error) {
            return { status: 400, body: 'Solicitud inválida, se esperaba un JSON' };
        }

        context.log(`Received no_cuenta: ${no_cuenta}`);

        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }
        context.log("Connected to database");

        // Obtiene un becario por numero de cuenta
        let result = await pool.request()
        .input('noCuenta', sql.NVarChar, no_cuenta)
            .query("SELECT * FROM becario WHERE no_cuenta = @noCuenta");
        context.log("Consulta ejecutada con éxito");

        return {
            body: JSON.stringify({ becario: result.recordset }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        context.log(`Error: ${error}`);
        return {
            status: 500,
            body: 'Internal Server Error'
        };
    }
};

app.http('getBecarioNoCuenta', {
    methods: ['POST'],
    extraOutputs: [sendToQueue],
    authLevel: 'anonymous',
    handler: getBecarioNoCuenta,
});
/*
export async function encryptPasswords(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        context.log("Iniciando encriptación de contraseñas...");

        let pool = await getDbConnection();
        if (!pool) {
            return { status: 500, body: 'No se pudo conectar a la base de datos' };
        }

        // Obtener todas las contraseñas sin encriptar
        let result = await pool.request().query("SELECT becario_id, contrasena FROM becario");

        for (const row of result.recordset) {
            const becarioId = row.becario_id;
            const plainPassword = row.contrasena;

            // Verificar si ya está encriptada (bcrypt empieza con $2b$ o $2a$)
            if (plainPassword.startsWith("$2b$") || plainPassword.startsWith("$2a$")) {
                context.log(`La contraseña del becario ${becarioId} ya está encriptada. Omitiendo...`);
                continue;
            }

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            // Actualizar la base de datos con la contraseña encriptada
            await pool.request()
                .input("hashedPassword", sql.NVarChar, hashedPassword)
                .input("becarioId", sql.NVarChar, becarioId)
                .query("UPDATE becario SET contrasena = @hashedPassword WHERE becario_id = @becarioId");

            context.log(`Contraseña encriptada para becario_id: ${becarioId}`);
        }

        return { body: 'Todas las contraseñas han sido encriptadas correctamente.' };
    } catch (error) {
        context.log(`Error: ${error}`);
        return { status: 500, body: 'Internal Server Error' };
    }
};

app.http('encryptPasswords', {
    methods: ['POST'],
    extraOutputs: [sendToQueue],
    authLevel: 'anonymous',
    handler: encryptPasswords,
});

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
            .query("SELECT contrasena FROM becario WHERE no_cuenta = @noCuenta");

        if (result.recordset.length === 0) {
            return { status: 404, body: 'No se encontró el becario' };
        }

        const storedPassword = result.recordset[0].contrasena;

        // Comparar la contraseña ingresada con la encriptada
        const isMatch = await bcrypt.compare(body.contrasena, storedPassword);
        if (!isMatch) {
            return { status: 401, body: 'Contraseña incorrecta' };
        }

        return { status: 200, body: 'Login exitoso' };
    } catch (error) {
        context.log(`Error: ${error}`);
        return { status: 500, body: 'Internal Server Error' };
    }
};

app.http('loginBecario', {
    methods: ['POST'],
    extraOutputs: [sendToQueue],
    authLevel: 'anonymous',
    handler: loginBecario
});
*/