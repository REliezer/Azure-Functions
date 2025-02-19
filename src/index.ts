import { getFAQ } from "./functions/FAQ/httpFAQ";
import { getAllBecarios, getBecarioNoCuenta } from "./functions/Becarios/httpBecario";
import { getCareerById } from "./functions/Carreras/httpCarreras";

export default {
    getFAQ,
    getAllBecarios,
    getBecarioNoCuenta,
    getCareerById
};
