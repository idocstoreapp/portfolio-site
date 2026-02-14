export interface DiagnosticAnswers {
    tipoEmpresa: 'restaurante' | 'servicio-tecnico' | 'fabrica' | 'otro';
    nivelDigital: 'nada' | 'basica' | 'funciona' | 'avanzada';
    objetivos: string[];
    tamano: '1-5' | '6-20' | '21-100' | '100+';
    necesidadesAdicionales?: string[];
}
export interface Solution {
    id: string;
    title: string;
    description: string;
    icon: string;
    link: string;
    matchScore: number;
    reason: string;
}
export interface DiagnosticResult {
    qualifies: boolean;
    primarySolution: Solution;
    complementarySolutions: Solution[];
    personalizedMessage: {
        title: string;
        subtitle: string;
        insight: string;
    };
    urgency: 'high' | 'medium' | 'low';
    nextSteps: {
        primary: {
            text: string;
            link: string;
        };
        secondary?: {
            text: string;
            link: string;
        };
    };
}
export declare function processDiagnostic(answers: DiagnosticAnswers): DiagnosticResult;
