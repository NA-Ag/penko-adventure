import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Pedir en una cafetería",
        role: "Eres un camarero en una cafetería concurrida.",
        objectives: ["Saludar al camarero", "Pedir una bebida", "Pedir comida", "Pedir la cuenta"]
    },
    directions: {
        title: "Pedir direcciones",
        role: "Eres una persona local amable en la calle.",
        objectives: ["Pedir disculpas educadamente", "Preguntar dónde está la estación de tren", "Dar las gracias"]
    },
    doctor_visit: {
        title: "En el médico",
        role: "Eres un médico. El usuario es un paciente.",
        objectives: ["Describir dos síntomas", "Entender los consejos del médico", "Preguntar sobre la medicación"]
    },
    shopping_clothes: {
        title: "Comprar ropa",
        role: "Eres un dependiente de tienda.",
        objectives: ["Pedir un artículo específico", "Hablar sobre las tallas", "Preguntar por el precio"]
    },
    job_interview: {
        title: "Entrevista de trabajo",
        role: "Eres un gerente de contratación que entrevista al usuario para un trabajo.",
        objectives: ["Presentarse profesionalmente", "Describir experiencia previa", "Hacer una pregunta sobre el puesto"]
    },
    meeting_friend: {
        title: "Conocer a un nuevo amigo",
        role: "Eres un estudiante en un parque.",
        objectives: ["Decir tu nombre y origen", "Preguntar el nombre de la otra persona", "Decir un adiós educado"]
    },
    planning_picnic: {
        title: "Planificar un picnic",
        role: "Eres un amigo del usuario.",
        objectives: ["Consultar el clima", "Sugerir una hora de encuentro", "Decidir qué comida llevar"]
    },
    new_coworker: {
        title: "Nuevo compañero de trabajo",
        role: "Eres un nuevo empleado en tu primer día.",
        objectives: ["Describir el entorno de la oficina", "Explicar las tareas diarias", "Dar un consejo útil"]
    },
    bank_account: {
        title: "Abrir una cuenta bancaria",
        role: "Eres un empleado de banco en Madrid.",
        objectives: ["Explicar el motivo de la visita", "Preguntar por los documentos", "Preguntar sobre las funciones de banca móvil"]
    },
    environmental_meeting: {
        title: "Reunión comunitaria ambiental",
        role: "Eres un organizador comunitario.",
        objectives: ["Argumentar a favor de una política específica", "Responder a las preocupaciones sobre los costos", "Resumir un punto de vista complejo"]
    },
    tradition_vs_modernity: {
        title: "Tradición vs Modernidad",
        role: "Eres un modernista que cree que las tradiciones impiden el progreso.",
        objectives: ["Comparar los valores históricos y modernos", "Usar modismos avanzados", "Analizar la identidad cultural"]
    },
    travel_complaint: {
        title: "Queja de viaje",
        role: "Eres un agente de aerolínea en el aeropuerto.",
        objectives: ["Explicar el problema", "Pedir un reembolso o cambio de billete", "Preguntar por un hotel"]
    },
    apartment_dispute: {
        title: "Disputa por el apartamento",
        role: "Eres un propietario que se resiste a pagar las reparaciones.",
        objectives: ["Describir el daño", "Argumentar por qué es responsabilidad del propietario", "Acordar una fecha de reparación"]
    },

    cultural_debate: {
        title: "Debate sobre redes sociales",
        role: "Eres un amigo escéptico con la tecnología.",
        objectives: ["Expresar una opinión", "Dar dos motivos de apoyo", "Responder a un contraargumento"]
    },
    legal_consultation: {
        title: "Consulta legal",
        role: "Eres un abogado especializado en propiedad intelectual.",
        objectives: ["Explicar el incumplimiento del contrato", "Preguntar por recursos legales", "Hablar de los posibles resultados"]
    },
    academic_seminar: {
        title: "Seminario académico",
        role: "Eres un profesor universitario.",
        objectives: ["Resumir tu posición", "Citar evidencias hipotéticas", "Responder a una crítica"]
    },
    philosophical_debate: {
        title: "Ética de la IA",
        role: "Eres un filósofo de renombre.",
        objectives: ["Definir un concepto abstracto complejo", "Usar metáforas sofisticadas", "Manejar la ironía y los matices"]
    },
    diplomatic_crisis: {
        title: "Negociación diplomática",
        role: "Eres un diplomático de alto nivel de una nación rival.",
        objectives: ["Expresar preocupaciones nacionales indirectamente", "Proponer un compromiso complejo", "Mantener un protocolo formal estricto"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Tu tarea: Continuar la historia en un máximo de 1 o 2 oraciones.
No uses encabezados, formato markdown ni charlas triviales. Escribe solo la historia en sí.
Incorpora siempre la acción del jugador y cualquier evento del sistema.
CRÍTICO: NO USES EL INGLÉS. Idioma: Español.
Tono: Descriptivo e inmersivo.
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Continúa la historia:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor de idiomas servicial.
Corrige la entrada. Si es correcta, di solo "Perfecto."
Explica brevemente los errores en español.<|im_end|>
<|im_start|>user
Original: ${userInput}
Corrección:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Escribe de forma más sencilla (CEFR A1).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Simplificado:<|im_end|>
<|im_start|>assistant
`;
};
