import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as jwt from "jsonwebtoken";

export async function authMiddleware(request: HttpRequest, context: InvocationContext, allowedRoles?: number[]): Promise<HttpResponseInit | null> {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { status: 403, body: JSON.stringify({ error: "Token requerido", state: false }) };
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
        // Verificar roles permitidos si se especificaron
        if (allowedRoles && allowedRoles.length > 0) {
            if (!decoded.role_level || !allowedRoles.includes(decoded.role_level)) {
                return { status: 403, body: JSON.stringify({ error: 'No tienes permisos para acceder a esta información', state: false }) };
            }
        }
        // Autenticación exitosa
        return null;

    } catch (err) {
        return { status: 403, body: JSON.stringify({ error: "Token inválido o expirado.", state: false }) };
    }
}
