// ActivityValidator.ts

interface ValidationRule {
    field: string;
    validator: (value: any) => boolean;
    message: string;
}

export class ActivityValidator {
    private static activityValidations: ValidationRule[] = [
        { field: 'nombre_actividad', validator: (value: any) => typeof value === 'string' && value.trim() !== '', message: 'El campo nombre_actividad es obligatorio.' },
        { field: 'descripcion', validator: (value: any) => typeof value === 'string' && value.trim() !== '', message: 'El campo descripcion es obligatorio.' },
        { field: 'fecha_actividad', validator: (value: any) => value && !isNaN(Date.parse(value)), message: 'El campo fecha_actividad debe ser una fecha válida.' },
        { field: 'numero_horas', validator: (value: any) => Number.isInteger(value) && value > 0, message: 'El campo numero_horas debe ser un número entero positivo.' },
        { field: 'ubicacion', validator: (value: any) => value === undefined || typeof value === 'string', message: 'El campo ubicacion debe ser un texto válido o estar vacío.' },
        { field: 'imagen', validator: (value: any) => value === undefined || typeof value === 'string', message: 'El campo imagen debe ser un texto válido o estar vacío.' },
        { field: 'estado_actividad', validator: (value: any) => value === undefined || ['Disponible', 'Terminada', 'Cancelada'].includes(value), message: 'El campo estado_actividad debe ser uno de los siguientes valores: Disponible, Terminada, Cancelada.' },
        { field: 'organizador', validator: (value: any) => value === undefined || typeof value === 'string', message: 'El campo organizador debe ser un texto válido o estar vacío.' },
    ];

    public static validate(body: any) {
        for (const validation of this.activityValidations) {
            if (!validation.validator(body[validation.field])) {
                return { valid: false, message: validation.message };
            }
        }
        return { valid: true };
    }
}
