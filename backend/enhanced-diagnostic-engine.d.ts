export type BusinessType = 'restaurante' | 'servicio-tecnico' | 'taller' | 'fabrica' | 'presencia-web' | 'comercio' | 'servicios' | 'otro';
export interface EnhancedDiagnosticAnswers {
    businessType: BusinessType;
    [key: string]: any;
}
export interface DiagnosticEnvelope {
    id: string;
    businessType: BusinessType;
    resultProfile: {
        systemType: string;
        recommendedModules: string[];
        applicableServices: string[];
    };
    opportunity: {
        title: string;
        description: string;
        painPoints: string[];
        benefits: string[];
    };
    recommendation: {
        primarySolution: {
            title: string;
            description: string;
            icon: string;
            link: string;
            matchScore: number;
            reason: string;
        };
        complementarySolutions: Array<{
            title: string;
            description: string;
            icon: string;
            link: string;
            reason: string;
        }>;
    };
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
export declare function processEnhancedDiagnostic(answers: EnhancedDiagnosticAnswers): DiagnosticEnvelope;
