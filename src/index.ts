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
import { getInfoBecarioReport } from "./functions/Reportes/getInfoBecarioReport";
import { sendEmail } from "./functions/Email/sendEmail";
import { sendEmailACS } from "./functions/Email/sendEmailACS";
import { encryptPasswords } from "./functions/Becarios/encryptPasswords";
import { encryptPasswordsEmployees } from "./functions/Employees/encryptPasswordsEmployees";
import { postActivityByAccount } from "./functions/ActividadesRealizadas/postActivityByAccount";
import { postActivityInProgressByAccount } from "./functions/ActividadesRealizadas/postActivityInProgressByAccount";
import { getInfoSeguimientobyNoCuenta } from "./functions/SeguimientoAcademico/getInfoSeguimientobyNoCuenta";
import { putStateBeca } from "./functions/SeguimientoAcademico/putStateBeca";
import { postReporteSeguimiento } from "./functions/SeguimientoAcademico/postReporteSeguimiento";
import { putPreguntas } from "./functions/FAQ/putFaq";
import { postFaq } from "./functions/FAQ/postFaq";
import { timerTriggerEstadoActividad } from "./functions/Actividades/timerTriggerEstadoActividad";
import { refreshAccessToken } from "./functions/auth/refreshAccessToken";
import { DeleteFAQ } from "./functions/FAQ/EliminarPregunta";
import { getplanillaByIdBecario } from "./functions/Planilla/getPlanillaByIdBecario";
import { postPlanilla } from "./functions/Planilla/postPlanilla";
import { getPlanillaAdministracion } from "./functions/Planilla/PlanillaAdministracion";
import { Deleteplanilla_Id } from "./functions/Planilla/DeleteplanillabyId";
import { informacionPlanillabyId } from "./functions/Planilla/informacionPlanillabyId";
import { getSasToken } from "./functions/auth/getSasToken";

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

app.http('refreshAccessToken', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'auth/refreshAccessToken',
    handler: refreshAccessToken,
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
    methods: ['POST'], 
    authLevel: 'anonymous',
    route: "getBecarioActivity",
        handler: getBecarioActivity,
});

//Actividades a las que asistio el becario por numero de cuenta
app.http('postActivityByAccount', {
    methods: ['POST'], 
    authLevel: 'anonymous',
    route: "postActivityByAccount",
        handler: postActivityByAccount,
});

//Actividades En Progreso con asistencia 0 y actividad fecha> fecha inscripcion
app.http('postActivityInProgressByAccount', {
    methods: ['POST'], 
    authLevel: 'anonymous',
    route: "postActivityInProgressByAccount",
        handler: postActivityInProgressByAccount,
});

app.http('putActivityAvailable', {
    methods: ['PUT'],
    authLevel: 'anonymous', 
    route: "putActivityAvailable",
    handler: putActivityAvailable,
});

app.http('deleteActivityById', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: "DeleteActivity", 
    handler: deleteActivityById,
});

app.http("postActivityAvailable", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "actividad/", 
    handler: postActivityAvailable,
});

//timer para actualizar el estado de la actividad si ya paso
app.timer('timerTriggerEstadoActividad', {
    schedule: '59 59 23 * * *', //Todos los días a las 23:59:59
    handler: timerTriggerEstadoActividad
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

app.http('putFaq', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: "putFaq",
    handler: putPreguntas,
});

app.http('postFaq', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: "postFaq",
    handler: postFaq,
});

app.http('DeleteFAQ', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: "DeleteFAQ", 
    handler: DeleteFAQ,
});

//Employees
//app.http('encryptPasswordsEmployees', {
//    methods: ['POST'],
//    authLevel: 'anonymous',
//    route: 'employees/encrypt',
//    handler: encryptPasswordsEmployees,
//});


//Becarios
app.http('getAllBecarios', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: "becarios",
    handler: getAllBecarios,
});

//app.http('encryptPasswords', {
//    methods: ['POST'],
//    authLevel: 'anonymous',
//    route: 'becarios/encrypt',
//    handler: encryptPasswords,
//});

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
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'becas/byId',
    handler: getBecaById,
});

app.http('getBecaStateById', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'beca_estado/{id?}',
    handler: getBecaStateById,
});

//Planilla
app.http('getplanillaByIdBecario', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'planilla',
    handler: getplanillaByIdBecario,
});

app.http('PlanillaAdministracion', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'PlanillaAdministracion',
    handler: getPlanillaAdministracion,
});

app.http('postPlanilla', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: "postPlanilla",
    handler: postPlanilla,
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

app.http('getInfoBecarioReport', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'report/infoBecario/{id}',
    handler: getInfoBecarioReport,
});


//obtenemos los comunicados ordenados por categoria de afiche...
app.http('getComunicados', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: "getComunicados/",
    handler: getComunicados,
});

// Registrar la API en Azure Functions
app.http("sendEmail", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "sendEmail",
    handler: sendEmail,
});

app.http("sendEmailACS", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "sendEmailACS",
    handler: sendEmailACS,
});

//Seguimiento Academico
app.http('getInfoSeguimientobyNoCuenta', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: "getInfoSeguimientobyNoCuenta/{no_cuenta}",
    handler: getInfoSeguimientobyNoCuenta,
});

app.http('putStateBeca', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: "putStateBeca",
    handler: putStateBeca,
});

app.http('postReporteSeguimiento', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: "reporteSeguimiento",
    handler: postReporteSeguimiento,
});

app.http('Deleteplanilla_Id', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: "Deleteplanilla_Id", 
    handler: Deleteplanilla_Id,
});


app.http('informacionPlanillabyId', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: "informacionPlanillabyId/{planilla_id}",
    handler: informacionPlanillabyId,
});

app.http('getSasToken', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: "getSasToken",
    handler: getSasToken,
});