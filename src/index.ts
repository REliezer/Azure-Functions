import * as dotenv from "dotenv";
dotenv.config();

import { app } from "@azure/functions";
import { getFAQ } from "./functions/FAQ/getFAQ";
import { getAllBecarios } from "./functions/Becarios/getAllBecarios";
import { getBecarioNoCuenta } from "./functions/Becarios/getBecarioNoCuenta";
import { getCareerById } from "./functions/Carreras/getCareerById";
import { loginBecario } from "./functions/auth/loginBecario";
import { getAllBecas } from "./functions/Becas/getAllBecas";
import { loginEmployee } from "./functions/auth/loginEmployee";
import { getActivities } from "./functions/Actividades/getActivities";
import { putActivityAvailable } from "./functions/Actividades/putActivityAvailable";
import { deleteActivityById } from "./functions/Actividades/deleteActivityById";
import { changePassword } from "./functions/auth/changePassword";
import { getBecaById } from "./functions/Becas/getBecaById";
import { getPlanillaByIdBecario } from "./functions/Planilla/getPlanillaByIdBecario";
import { getBecarioActivity } from "./functions/Actividades/getBecarioActivity";
import { getPersonaById } from "./functions/Persona/getPersonaById";
import { getBecaStateById } from "./functions/Becas/getBecaStateById";
import { storage } from "./functions/imgStorage/storage";
import { postActivityAvailable } from "./functions/Actividades/postActivityAvailable";
import { postInscriptionActivity } from "./functions/Actividades/InscripcionActividades/postInscriptionActivity";
import { deleteInscriptionActivity } from "./functions/Actividades/InscripcionActividades/deleteInscriptionActivity";
import { getParticipantesByActividadId } from "./functions/ActividadesRealizadas/getParticipantesByActividadId";
import { putAsistencia } from "./functions/Actividades/InscripcionActividades/putAsistencia";
import { getComunicados } from "./functions/Comunicados/getComunicados";
import { getReportByNoCuenta } from "./functions/Reportes/getReportByNoCuenta";


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

//actividades de becario disponibles
app.http('getBecarioActivity', {
    methods: ['GET'], 
    authLevel: 'anonymous',
    route: "getBecarioActivity",
        handler: getBecarioActivity,
});

app.http('putActivityAvailable', {
    methods: ['PUT'],  // Usamos el método PUT
    authLevel: 'anonymous',  // Puedes cambiar el nivel de autenticación según lo que necesites
    route: "putActivityAvailable",  // Ruta dinámica para el id de la actividad
    handler: putActivityAvailable,  // Llamamos la función que maneja la actualización
});

app.http('deleteActivityById', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: "DeleteActivity", 
    handler: deleteActivityById,
});

app.http("actividad", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "actividad/", 
    handler: postActivityAvailable,
});

//Inscripcion Actividades
app.http('postInscriptionActivity', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: "inscriptionActivity",
    handler: postInscriptionActivity,
});

app.http('deleteInscriptionActivity', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: "deleteInscriptionActivity",
    handler: deleteInscriptionActivity,
});

app.http('getParticipantesByActividadId', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: "participantsActivity/{id?}",
    handler: getParticipantesByActividadId,
});

app.http('putAsistencia', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: "updateAttendanceActivity",
    handler: putAsistencia,
});

//Preguntas Frecuentes
app.http('getFAQ', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: "faq",
    handler: getFAQ,
});

/*Employees
app.http('encryptPasswordsEmployees', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'employees/encrypt',
    handler: encryptPasswordsEmployees,
});
*/

//Becarios
app.http('getAllBecarios', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: "becarios",
    handler: getAllBecarios,
});
/*
app.http('encryptPasswords', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'becarios/encrypt',
    handler: encryptPasswords,
});
*/
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

app.http('getBecaById', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'becas/{id?}',
    handler: getBecaById,
});

app.http('getBecaStateById', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'beca_estado/{id?}',
    handler: getBecaStateById,
});

//Planilla
app.http('getPlanillaByIdBecario', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'planilla/{id?}',
    handler: getPlanillaByIdBecario,
});

//Persona
app.http('getPersonaById', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'person/{id?}',
    handler: getPersonaById,
});


// Registrar la función en Azure Functions con `app.http()`
app.http("storage", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "storage/", 
    handler: storage,
});

//Reportes
app.http('getReportByNoCuenta', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'report/{id}',
    handler: getReportByNoCuenta,
});



//obtenemos los comunicados ordenados por categoria de afiche...
app.http('getComunicados', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: "getComunicados/",
    handler: getComunicados,
});
