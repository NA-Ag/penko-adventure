import { Scenario } from '../../frameworks/types';

export const LOCALIZED_SCENARIOS: Record<string, any> = {
    cafe_order: {
        title: "Pedir num Café",
        role: "Você é um barista num café movimentado.",
        objectives: ["Cumprimentar o barista", "Pedir uma bebida", "Pedir comida", "Pedir a conta"]
    },
    directions: {
        title: "Pedir Direções",
        role: "Você é um habitante local prestativo na rua.",
        objectives: ["Pedir desculpas educadamente", "Perguntar onde fica a estação de comboio", "Agradecer ao habitante local"]
    },
    doctor_visit: {
        title: "No Médico",
        role: "Você é um médico. O utilizador é um paciente.",
        objectives: ["Descrever dois sintomas", "Compreender os conselhos do médico", "Perguntar sobre a medicação"]
    },
    shopping_clothes: {
        title: "Comprar Roupa",
        role: "Você é um assistente de loja.",
        objectives: ["Pedir um artigo específico", "Discutir tamanhos", "Perguntar sobre o preço"]
    },
    job_interview: {
        title: "Entrevista de Emprego",
        role: "Você é um gestor de recrutamento que entrevista o utilizador para um emprego.",
        objectives: ["Apresentar-se profissionalmente", "Descrever experiência passada", "Fazer uma pergunta sobre a função"]
    },
    meeting_friend: {
        title: "Conhecendo um Novo Amigo",
        role: "Você é um estudante em um parque.",
        objectives: ["Diga seu nome e origem", "Pergunte o nome da outra pessoa", "Diga um adeus educado"]
    },
    planning_picnic: {
        title: "Planejando um Piquenique",
        role: "Você é um amigo do usuário.",
        objectives: ["Verifique o clima", "Sugira um horário para o encontro", "Decida qual comida levar"]
    },
    new_coworker: {
        title: "Novo Colega de Trabalho",
        role: "Você é um novo funcionário em seu primeiro dia.",
        objectives: ["Descreva o ambiente do escritório", "Explique as tarefas diárias", "Dê uma dica útil"]
    },
    bank_account: {
        title: "Abrindo uma Conta Bancária",
        role: "Você é um funcionário de banco em Lisboa.",
        objectives: ["Explique o motivo da visita", "Inquira sobre documentos", "Pergunte sobre as funções de mobile banking"]
    },
    environmental_meeting: {
        title: "Reunião Comunitária Ambiental",
        role: "Você é um organizador comunitário.",
        objectives: ["Apresente um argumento para uma política específica", "Responda a preocupações sobre custos", "Resuma um ponto de vista complexo"]
    },
    tradition_vs_modernity: {
        title: "Tradição vs Modernidade",
        role: "Você é um modernista que acredita que as tradições impedem o progresso.",
        objectives: ["Compare valores históricos e modernos", "Use idiomas avançados", "Analise a identidade cultural"]
    },
    travel_complaint: {
        title: "Reclamação de Viagem",
        role: "Você é um agente de companhia aérea no aeroporto.",
        objectives: ["Explicar o problema", "Pedir um reembolso ou nova reserva", "Perguntar sobre um hotel"]
    },
    apartment_dispute: {
        title: "Disputa de Apartamento",
        role: "Você é um senhorio relutante em pagar por reparações.",
        objectives: ["Descrever o dano", "Argumentar por que é responsabilidade do senhorio", "Acordar uma data de reparação"]
    },

    cultural_debate: {
        title: "Debate sobre Redes Sociais",
        role: "Você é um amigo cético em relação à tecnologia.",
        objectives: ["Expressar uma opinião", "Dar duas razões de apoio", "Responder a um contra-argumento"]
    },
    legal_consultation: {
        title: "Consulta Jurídica",
        role: "Você é um advogado especializado em propriedade intelectual.",
        objectives: ["Explicar a quebra de contrato", "Perguntar sobre recursos legais", "Discutir possíveis resultados"]
    },
    academic_seminar: {
        title: "Seminário Académico",
        role: "Você é um professor universitário.",
        objectives: ["Resumir a sua posição", "Citar evidências hipotéticas", "Responder a uma crítica"]
    },
    philosophical_debate: {
        title: "Ética da IA",
        role: "Você é um filósofo de renome.",
        objectives: ["Definir um conceito abstrato complexo", "Usar metáforas sofisticadas", "Lidar com ironia e nuances"]
    },
    diplomatic_crisis: {
        title: "Negociação Diplomática",
        role: "Você é um diplomata de alto nível de uma nação rival.",
        objectives: ["Expressar preocupações nacionais indiretamente", "Propor um compromisso complexo", "Manter um protocolo formal estrito"]
    }
};

export const narrative = (language: string, levelName: string, scenario: Scenario, history: string, action: string, systemEvent?: string): string => {
    const local = LOCALIZED_SCENARIOS[scenario.id] || { title: scenario.title, role: scenario.systemPrompt, objectives: scenario.objectives };

    return `<|im_start|>system
${levelName} - Penko.
${local.role}

${local.title}
${local.objectives.join(', ')}

Sua tarefa: Continuar a história em no máximo 1 ou 2 frases.
Não use cabeçalhos, formatação markdown ou conversas irrelevantes. Escreva apenas a própria história.
Sempre inclua a ação do jogador e quaisquer eventos do sistema.
CRÍTICO: NÃO USE INGLÊS. Idioma: Português.
Tom: Descritivo e imersivo.
<|im_end|>
<|im_start|>user
${history}
${systemEvent ? `${systemEvent}` : ''}
${action}
Continue a história:<|im_end|>
<|im_start|>assistant
`;
};

export const grammar = (userInput: string): string => {
    return `<|im_start|>system
Tutor de idiomas prestativo.
Corrija a entrada. Se estiver correta, diga apenas "Perfeito.".
Explique os erros brevemente em português.<|im_end|>
<|im_start|>user
Original: ${userInput}
Correção:<|im_end|>
<|im_start|>assistant
`;
};

export const simplify = (narrativeText: string): string => {
    return `<|im_start|>system
Escreva de forma mais simples (CEFR A1).<|im_end|>
<|im_start|>user
Original: ${narrativeText}
Simplificado:<|im_end|>
<|im_start|>assistant
`;
};
