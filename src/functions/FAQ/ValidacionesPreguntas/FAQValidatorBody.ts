// FaqValidator.ts

interface ValidationRule {
    field: string;
    validator: (value: any) => boolean;
    message: string;
}

export class FaqValidator {
    private static FaqValidations: ValidationRule[] = [
        { field: 'pregunta', validator: (value: any) => typeof value === 'string' && value.trim() !== '', message: 'El campo pregunta es obligatorio.' },
        { field: 'respuesta', validator: (value: any) => typeof value === 'string' && value.trim() !== '', message: 'El campo respuesta es obligatorio.' },
        ];

    public static validate(body: any) {
        for (const validation of this.FaqValidations) {
            if (!validation.validator(body[validation.field])) {
                return { valid: false, message: validation.message };
            }
        }
        return { valid: true };
    }
}
