interface ValidationRule {
    field: string;
    validator: (value: any) => boolean;
    message: string;
}

export class PlanillaValidator {
    private static PlanillaValidations: ValidationRule[] = [
        { field: 'mes', validator: (value: any) => typeof value === 'string' && value.trim() !== '', message: 'El campo mes es obligatorio.' },
        { field: 'anio', validator: (value: any) => typeof value === 'number' && value >= 0, message: 'El campo año es obligatorio y debe ser un número.' },
        { field: 'centro_estudio_id', validator: (value: any) => typeof value === 'number' && value >= 0, message: 'El campo centro de estudio es obligatorio y debe ser un número válido.' },
        { field: 'empleado_id', validator: (value: any) => typeof value === 'string' && value.trim() !== '', message: 'El campo empleado es obligatorio.' },
    ];

    public static validate(body: any) {
        for (const validation of this.PlanillaValidations) {
            if (!validation.validator(body[validation.field])) {
                return { valid: false, message: validation.message };
            }
        }
        return { valid: true };
    }
}
