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
import { changePassword } from "./functions/auth/changePassword";

//Auth
app.http('loginBecario', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/loginBecario',
    handler: loginBecario,
});

app.http('loginEmployee', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/loginEmployee',
    handler: loginEmployee,
});

app.http('changePassword', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/changePassword',
    handler: changePassword,
});

//Actividades
app.http('getActivities', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: "activities",
    handler: getActivities,
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