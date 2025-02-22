import { app } from "@azure/functions";
import { getFAQ } from "./functions/FAQ/getFAQ";
import { getAllBecarios } from "./functions/Becarios/getAllBecarios";
import { getBecarioNoCuenta } from "./functions/Becarios/getBecarioNoCuenta";
import { getCareerById } from "./functions/Carreras/getCareerById";
import { loginBecario } from "./functions/auth/loginBecario";
import { encryptPasswords } from "./functions/Becarios/encryptPasswords";
import { getAllBecas } from "./functions/Becas/getAllBecas";
import { loginEmployee } from "./functions/auth/loginEmployee";
import { encryptPasswordsEmployees } from "./functions/Employees/encryptPasswordsEmployees";
import { getActivities } from "./functions/Actividades/getActivities";
import { putActivityAvailable } from "./functions/Actividades/putActivityAvailable";

//Actividades
app.http('getActivities', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: "activities",
    handler: getActivities,
});

app.http('putActivityAvailable', {
    methods: ['PUT'],  // Usamos el método PUT
    authLevel: 'anonymous',  // Puedes cambiar el nivel de autenticación según lo que necesites
    route: "putActivityAvailable",  // Ruta dinámica para el id de la actividad
    handler: putActivityAvailable,  // Llamamos la función que maneja la actualización
});

//Preguntas Frecuentes
app.http('getFAQ', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: "faq",
    handler: getFAQ,
});


//Employees
app.http('encryptPasswordsEmployees', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'employees/encrypt',
    handler: encryptPasswordsEmployees,
});

//Becarios
app.http('getAllBecarios', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: "becarios",
    handler: getAllBecarios,
});


app.http('encryptPasswords', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'becarios/encrypt',
    handler: encryptPasswords,
});

app.http('getBecarioNoCuenta', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: "becarios/nocuenta",
    handler: getBecarioNoCuenta,
});

//Carreras
app.http('getCareerById', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'career/{id?}',
    handler: getCareerById,
});

//Becas
app.http('getAllBecas', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: "becas",
    handler: getAllBecas,
});