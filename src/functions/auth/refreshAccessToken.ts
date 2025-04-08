import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
const jwt = require('jsonwebtoken');

export async function refreshAccessToken(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        // Set CORS headers for preflight requests
        if (request.method === 'OPTIONS') {
            return {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie'
                }
            };
        }

        const cookieHeader = request.headers.get('cookie');
        if (!cookieHeader) {
            return {
                status: 401,
                body: 'No se proporcionó el refresh token',
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie'
                }
            };
        }
        const refreshToken = cookieHeader.split('; ').find((cookie) => cookie.startsWith('refreshToken='))?.split('=')[1];

        if (!refreshToken) {
            return {
                status: 401,
                body: 'Refresh token no encontrado',
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie'
                }
            };
        }

        if (!process.env.JWT_REFRESH_SECRET || !process.env.JWT_SECRET) {
            throw new Error("JWT_REFRESH_SECRET o JWT_SECRET no están definidos en las variables de entorno");
        }

        // Verificar el refresh token
        let payload;
        try {
            payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
            context.log('payload', payload);
        } catch (err) {
            return {
                status: 401,
                body: 'Refresh token inválido o expirado',
                headers: {
                    'Access-Control-Allow-Origin': 'http://localhost:5173',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie'
                }
            };
        }

        const { iat, exp, tipo, ...restOfPayload } = payload;
        const newAccessToken = jwt.sign(
            restOfPayload,
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return {
            status: 200,
            body: JSON.stringify({ token: newAccessToken }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:5173',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie'
            }

        };
    } catch (error) {
        context.log(`Error: ${error}`);
        return {
            status: 500,
            body: 'Internal Server Error',
            headers: {
                'Access-Control-Allow-Origin': 'http://localhost:5173',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie'
            }
        };
    }
}