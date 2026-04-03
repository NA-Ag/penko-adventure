import { Language } from '../../types';

export const EDUCATIONAL_TRANSLATIONS: Record<string, any> = {
    [Language.ENGLISH]: {
        change_level: "Change Level",
        scenarios_available: "Scenarios Available",
        exam_track: "Exam Track",
        level_beginner: "Beginner",
        level_elementary: "Elementary",
        level_intermediate: "Intermediate",
        level_upper_intermediate: "Upper Intermediate",
        level_advanced: "Advanced",
        level_mastery: "Mastery",
        objectives_label: "Objectives",
        scenarios: {
            cafe_order: {
                title: "Ordering at a Cafe",
                description: "Order a coffee and a pastry at a local cafe.",
                objectives: ["Greet the barista", "Order a drink", "Order food", "Ask for the bill"]
            },
            directions: {
                title: "Asking for Directions",
                description: "You are lost and need to find the train station.",
                objectives: ["Excuse yourself politely", "Ask where the train station is", "Thank the local"]
            },
            doctor_visit: {
                title: "At the Doctor",
                description: "Explain your symptoms to a doctor.",
                objectives: ["Describe two symptoms", "Understand the doctor's advice", "Ask about medication"]
            },
            shopping_clothes: {
                title: "Clothes Shopping",
                description: "Find a specific item of clothing in a store.",
                objectives: ["Ask for a specific item", "Discuss sizes", "Ask about the price"]
            },
            job_interview: {
                title: "Job Interview",
                description: "Interview for a part-time job.",
                objectives: ["Introduce yourself professionally", "Describe past experience", "Ask a question about the role"]
            },
            travel_complaint: {
                title: "Travel Complaint",
                description: "Complain about a cancelled flight at the airport.",
                objectives: ["Explain the problem", "Request a refund or rebooking", "Inquire about a hotel"]
            },
            apartment_dispute: {
                title: "Apartment Dispute",
                description: "Negotiate repairs with a difficult landlord.",
                objectives: ["Describe the damage", "Argue why it is the landlord's responsibility", "Agree on a repair date"]
            },
            cultural_debate: {
                title: "Social Media Debate",
                description: "Discuss the impact of technology on society.",
                objectives: ["State an opinion", "Provide two supporting reasons", "Counter-argue a point"]
            },
            legal_consultation: {
                title: "Legal Consultation",
                description: "Discuss a complex contract issue with a lawyer.",
                objectives: ["Explain the breach of contract", "Inquire about legal remedies", "Discuss potential outcomes"]
            },
            academic_seminar: {
                title: "Academic Seminar",
                description: "Defend a thesis point in a graduate seminar.",
                objectives: ["Summarize your position", "Cite hypothetical evidence", "Respond to a critical counter-point"]
            },
            philosophical_debate: {
                title: "Ethics of AI",
                description: "Debate the nature of consciousness with a philosopher.",
                objectives: ["Define a complex abstract concept", "Use sophisticated metaphors", "Handle irony and nuance"]
            },
            diplomatic_crisis: {
                title: "Diplomatic Negotiation",
                description: "Resolve a boundary dispute between two nations.",
                objectives: ["Express national concerns indirectly", "Propose a complex compromise", "Maintain strict formal protocol"]
            },
            pharmacy_visit: {
                title: "At the Pharmacy",
                description: "Describe symptoms and ask for medicine.",
                objectives: ["Describe a symptom clearly", "Ask about dosage", "Inquire about side effects"]
            },
            festival_volunteer: {
                title: "Local Festival Volunteer",
                description: "Discuss duties at a local Matsuri.",
                objectives: ["Ask about your specific role", "Confirm the event timing", "Navigate a social hierarchy politely"]
            },
            meeting_friend: {
                title: "Meeting a New Friend",
                description: "Introduce yourself at a park.",
                objectives: ["State your name and origin", "Ask for the other person's name", "Say a polite farewell"]
            },
            planning_picnic: {
                title: "Planning a Picnic",
                description: "Coordinate weekend plans with a friend.",
                objectives: ["Check the weather", "Suggest a meeting time", "Decide on food to bring"]
            },
            bank_account: {
                title: "Opening a Bank Account",
                description: "Handle administrative tasks at a bank.",
                objectives: ["Explain the reason for the visit", "Inquire about documents", "Ask about mobile banking features"]
            },
            environmental_meeting: {
                title: "Environmental Community Meeting",
                description: "Discuss plastic waste reduction.",
                objectives: ["Argue for a specific policy", "Respond to a concern about cost", "Summarize a complex viewpoint"]
            }
        }
    },
    [Language.SPANISH]: {
        change_level: "Cambiar Nivel",
        scenarios_available: "Escenarios Disponibles",
        exam_track: "Trayectoria de Examen",
        level_beginner: "Principiante",
        level_elementary: "Elemental",
        level_intermediate: "Intermedio",
        level_upper_intermediate: "Intermedio Alto",
        level_advanced: "Avanzado",
        level_mastery: "Maestría",
        objectives_label: "Objetivos",
        scenarios: {
            cafe_order: {
                title: "Pedir en una Cafetería",
                description: "Pide un café y un bollo en una cafetería local.",
                objectives: ["Saludar al camarero", "Pedir una bebida", "Pedir comida", "Pedir la cuenta"]
            },
            directions: {
                title: "Pedir Direcciones",
                description: "Estás perdido y necesitas encontrar la estación de tren.",
                objectives: ["Pedir disculpas educadamente", "Preguntar dónde está la estación de tren", "Dar las gracias"]
            },
            doctor_visit: {
                title: "En el Médico",
                description: "Explica tus síntomas a un médico.",
                objectives: ["Describir dos síntomas", "Entender los consejos del médico", "Preguntar sobre la medicación"]
            },
            shopping_clothes: {
                title: "Comprar Ropa",
                description: "Busca una prenda específica en una tienda.",
                objectives: ["Pedir un artículo específico", "Hablar sobre las tallas", "Preguntar por el precio"]
            },
            job_interview: {
                title: "Entrevista de Trabajo",
                description: "Entrevista para un trabajo a tiempo parcial.",
                objectives: ["Presentarse profesionalmente", "Describir experiencia previa", "Hacer una pregunta sobre el puesto"]
            },
            travel_complaint: {
                title: "Queja de Viaje",
                description: "Reclama por un vuelo cancelado en el aeropuerto.",
                objectives: ["Explicar el problema", "Pedir un reembolso o cambio de billete", "Preguntar por un hotel"]
            },
            apartment_dispute: {
                title: "Disputa por el Apartamento",
                description: "Negocia reparaciones con un casero difícil.",
                objectives: ["Describir el daño", "Argumentar por qué es responsabilidad del propietario", "Acordar una fecha de reparación"]
            },
            cultural_debate: {
                title: "Debate sobre Redes Sociales",
                description: "Habla sobre el impacto de la tecnología en la sociedad.",
                objectives: ["Expresar una opinión", "Dar dos motivos de apoyo", "Responder a un contraargumento"]
            },
            legal_consultation: {
                title: "Consulta Legal",
                description: "Habla sobre un problema de contrato complejo con un abogado.",
                objectives: ["Explicar el incumplimiento del contrato", "Preguntar por recursos legales", "Hablar de los posibles resultados"]
            },
            academic_seminar: {
                title: "Seminario Académico",
                description: "Defiende un punto de tu tesis en un seminario.",
                objectives: ["Resumir tu posición", "Citar evidencias hipotéticas", "Responder a una crítica"]
            },
            philosophical_debate: {
                title: "Ética de la IA",
                description: "Debate sobre la naturaleza de la conciencia con un filósofo.",
                objectives: ["Definir un concepto abstracto complejo", "Usar metáforas sofisticadas", "Manejar la ironía y los matices"]
            },
            diplomatic_crisis: {
                title: "Negociación Diplomática",
                description: "Resuelve una disputa fronteriza entre dos naciones.",
                objectives: ["Expresar preocupaciones nacionales indirectamente", "Proponer un compromiso complejo", "Mantener un protocolo formal estricto"]
            },
            pharmacy_visit: {
                title: "En la Farmacia",
                description: "Describe síntomas y pide medicinas.",
                objectives: ["Describir un síntoma claramente", "Preguntar sobre la dosis", "Consultar sobre efectos secundarios"]
            },
            festival_volunteer: {
                title: "Voluntario en Festival Local",
                description: "Habla sobre tus tareas en un Matsuri local.",
                objectives: ["Preguntar sobre tu función específica", "Confirmar el horario del evento", "Navegar la jerarquía social educadamente"]
            },
            meeting_friend: {
                title: "Conocer a un Nuevo Amigo",
                description: "Preséntate en un parque.",
                objectives: ["Decir tu nombre y origen", "Preguntar el nombre de la otra persona", "Despedirse educadamente"]
            },
            planning_picnic: {
                title: "Planear un Picnic",
                description: "Coordina planes para el fin de semana con un amigo.",
                objectives: ["Consultar el clima", "Sugerir una hora de encuentro", "Decidir qué comida llevar"]
            },
            bank_account: {
                title: "Abrir una Cuenta Bancaria",
                description: "Gestiona tareas administrativas en un banco.",
                objectives: ["Explicar el motivo de la visita", "Preguntar por los documentos", "Consultar funciones de banca móvil"]
            },
            environmental_meeting: {
                title: "Reunión Comunitaria Ambiental",
                description: "Habla sobre la reducción de residuos plásticos.",
                objectives: ["Argumentar a favor de una política", "Responder a una inquietud sobre el coste", "Resumir un punto de vista complejo"]
            }
        }
    },
    [Language.FRENCH]: {
        change_level: "Changer de Niveau",
        scenarios_available: "Scénarios Disponibles",
        exam_track: "Parcours d'Examen",
        level_beginner: "Débutant",
        level_elementary: "Élémentaire",
        level_intermediate: "Indépendant",
        level_upper_intermediate: "Avancé",
        level_advanced: "Autonome",
        level_mastery: "Maîtrise",
        objectives_label: "Objectifs",
        scenarios: {
            cafe_order: {
                title: "Commander au Café",
                description: "Commandez un café et une pâtisserie dans un café local.",
                objectives: ["Saluer le barista", "Commander une boisson", "Commander de la nourriture", "Demander l'addition"]
            },
            directions: {
                title: "Demander son Chemin",
                description: "Vous êtes perdu et devez trouver la gare.",
                objectives: ["S'excuser poliment", "Demander où se trouve la gare", "Remercier l'habitant"]
            },
            doctor_visit: {
                title: "Chez le Médecin",
                description: "Expliquez vos symptômes à un médecin.",
                objectives: ["Décrire deux symptômes", "Comprendre les conseils du médecin", "Poser des questions sur les médicaments"]
            },
            shopping_clothes: {
                title: "Achat de Vêtements",
                description: "Trouvez un article spécifique dans un magasin.",
                objectives: ["Demander un article spécifique", "Discuter des tailles", "Demander le prix"]
            },
            job_interview: {
                title: "Entretien d'Embauche",
                description: "Entretien pour un emploi à temps partiel.",
                objectives: ["Se présenter professionnellement", "Décrire une expérience passée", "Poser une question sur le poste"]
            },
            travel_complaint: {
                title: "Réclamation de Voyage",
                description: "Réclamez pour un vol annulé à l'aéroport.",
                objectives: ["Expliquer le problème", "Demander un remboursement ou un changement de réservation", "Se renseigner sur un hôtel"]
            },
            apartment_dispute: {
                title: "Litige d'Appartement",
                description: "Négociez des réparations avec un propriétaire difficile.",
                objectives: ["Décrire les dommages", "Expliquer pourquoi c'est la responsabilité du propriétaire", "Convenir d'une date de réparation"]
            },
            cultural_debate: {
                title: "Débat sur les Réseaux Sociaux",
                description: "Discutez de l'impact de la technologie sur la société.",
                objectives: ["Exprimer une opinion", "Donner deux raisons de soutien", "Répondre à un contre-argument"]
            },
            legal_consultation: {
                title: "Consultation Juridique",
                description: "Discutez d'un problème de contrat complexe avec un avocat.",
                objectives: ["Expliquer la rupture de contrat", "S'enquérir des recours juridiques", "Discuter des résultats possibles"]
            },
            academic_seminar: {
                title: "Séminaire Académique",
                description: "Défendez un point de thèse dans un séminaire de master.",
                objectives: ["Résumer votre position", "Citer des preuves hypothétiques", "Répondre à un point critique"]
            },
            philosophical_debate: {
                title: "Éthique de l'IA",
                description: "Débattez de la nature de la conscience avec un philosophe.",
                objectives: ["Définir un concept abstrait complexe", "Utiliser des métaphores sophistiquées", "Gérer l'ironie et les nuances"]
            },
            diplomatic_crisis: {
                title: "Négociation Diplomatique",
                description: "Résolvez un conflit frontalier entre deux nations.",
                objectives: ["Exprimer les préoccupations nationales indirectement", "Proposer un compromis complexe", "Maintenir un protocole formel strict"]
            },
            pharmacy_visit: {
                title: "À la Pharmacie",
                description: "Décrivez des symptômes et demandez des médicaments.",
                objectives: ["Décrire un symptôme clairement", "Demander le dosage", "Se renseigner sur les effets secondaires"]
            },
            festival_volunteer: {
                title: "Bénévole de Festival",
                description: "Discutez des tâches lors d'un Matsuri local.",
                objectives: ["Interroger sur votre rôle spécifique", "Confirmer l'horaire de l'événement", "Naviguer poliment dans la hiérarchie sociale"]
            },
            meeting_friend: {
                title: "Rencontrer un Ami",
                description: "Présentez-vous dans un parc.",
                objectives: ["Donner votre nom et origine", "Demander le nom de l'autre personne", "Dire au revoir poliment"]
            },
            planning_picnic: {
                title: "Prévoir un Pique-nique",
                description: "Coordonnez les plans du week-end avec un ami.",
                objectives: ["Vérifier la météo", "Suggérer une heure de rendez-vous", "Décider de la nourriture à apporter"]
            },
            bank_account: {
                title: "Ouvrir un Compte Bancaire",
                description: "Gérez des tâches administratives dans une banque.",
                objectives: ["Expliquer la raison de la visite", "S'informer sur les documents", "Se renseigner sur les fonctions bancaires mobiles"]
            },
            environmental_meeting: {
                title: "Réunion Communautaire",
                description: "Discutez de la réduction des déchets plastiques.",
                objectives: ["Argumenter pour une politique spécifique", "Répondre à une inquiétude sur le coût", "Résumer un point de vue complexe"]
            }
        }
    },
    [Language.GERMAN]: {
        change_level: "Stufe ändern",
        scenarios_available: "Verfügbare Szenarien",
        exam_track: "Prüfungspfad",
        level_beginner: "Anfänger",
        level_elementary: "Grundlagen",
        level_intermediate: "Mittelstufe",
        level_upper_intermediate: "Fortgeschrittene Mittelstufe",
        level_advanced: "Fortgeschritten",
        level_mastery: "Beherrschung",
        objectives_label: "Ziele",
        scenarios: {
            cafe_order: {
                title: "Im Café bestellen",
                description: "Bestellen Sie einen Kaffee und ein Gebäck in einem lokalen Café.",
                objectives: ["Den Barista begrüßen", "Ein Getränk bestellen", "Essen bestellen", "Nach der Rechnung fragen"]
            },
            directions: {
                title: "Nach dem Weg fragen",
                description: "Sie haben sich verlaufen und müssen den Bahnhof finden.",
                objectives: ["Höflich entschuldigen", "Nach dem Bahnhof fragen", "Sich beim Einheimischen bedanken"]
            },
            doctor_visit: {
                title: "Beim Arzt",
                description: "Erklären Sie einem Arzt Ihre Symptome.",
                objectives: ["Zwei Symptome beschreiben", "Den Rat des Arztes verstehen", "Nach Medikamenten fragen"]
            },
            shopping_clothes: {
                title: "Kleidung kaufen",
                description: "Finden Sie ein bestimmtes Kleidungsstück in einem Geschäft.",
                objectives: ["Nach einem bestimmten Artikel fragen", "Größen besprechen", "Nach dem Preis fragen"]
            },
            job_interview: {
                title: "Vorstellungsgespräch",
                description: "Vorstellungsgespräch für einen Nebenjob.",
                objectives: ["Sich professionell vorstellen", "Frühere Erfahrungen beschreiben", "Eine Frage zur Stelle stellen"]
            },
            travel_complaint: {
                title: "Reisebeschwerde",
                description: "Beschweren Sie sich am Flughafen über einen annullierten Flug.",
                objectives: ["Das Problem erklären", "Erstattung oder Umbuchung verlangen", "Nach einem Hotel fragen"]
            },
            apartment_dispute: {
                title: "Wohnungsstreit",
                description: "Verhandeln Sie Reparaturen mit einem schwierigen Vermieter.",
                objectives: ["Den Schaden beschreiben", "Argumentieren, warum der Vermieter zuständig ist", "Einen Termin vereinbaren"]
            },
            cultural_debate: {
                title: "Social-Media-Debatte",
                description: "Diskutieren Sie über die Auswirkungen der Technologie auf die Gesellschaft.",
                objectives: ["Eine Meinung äußern", "Zwei Gründe nennen", "Auf ein Gegenargument antworten"]
            },
            legal_consultation: {
                title: "Rechtsberatung",
                description: "Besprechen Sie ein komplexes Vertragsproblem mit einem Anwalt.",
                objectives: ["Den Vertragsbruch erklären", "Nach rechtlichen Möglichkeiten fragen", "Mögliche Ergebnisse besprechen"]
            },
            academic_seminar: {
                title: "Akademisches Seminar",
                description: "Verteidigen Sie einen Thesenpunkt in einem Oberseminar.",
                objectives: ["Ihre Position zusammenfassen", "Hypothetische Beweise zitieren", "Auf Kritik antworten"]
            },
            philosophical_debate: {
                title: "KI-Ethik",
                description: "Debattieren Sie mit einem Philosophen über die Natur des Bewusstseins.",
                objectives: ["Ein komplexes abstraktes Konzept definieren", "Anspruchsvolle Metaphern nutzen", "Mit Ironie und Nuancen umgehen"]
            },
            diplomatic_crisis: {
                title: "Diplomatische Verhandlung",
                description: "Lösen Sie einen Grenzstreit zwischen zwei Nationen.",
                objectives: ["Nationale Bedenken indirekt ausdrücken", "Einen komplexen Kompromiss vorschlagen", "Das Protokoll wahren"]
            },
            pharmacy_visit: {
                title: "In der Apotheke",
                description: "Beschreiben Sie Symptome und fragen Sie nach Medikamenten.",
                objectives: ["Ein Symptom klar beschreiben", "Nach der Dosierung fragen", "Nach Nebenwirkungen erkundigen"]
            },
            festival_volunteer: {
                title: "Freiwilliger beim Volksfest",
                description: "Besprechen Sie Ihre Aufgaben bei einem lokalen Matsuri.",
                objectives: ["Nach Ihrer spezifischen Rolle fragen", "Den Veranstaltungszeitpunkt bestätigen", "Höflich in der Hierarchie agieren"]
            },
            meeting_friend: {
                title: "Einen neuen Freund treffen",
                description: "Stellen Sie sich in einem Park vor.",
                objectives: ["Name und Herkunft nennen", "Nach dem Namen der anderen Person fragen", "Sich höflich verabschieden"]
            },
            planning_picnic: {
                title: "Ein Picknick planen",
                description: "Koordinieren Sie Wochenendpläne mit einem Freund.",
                objectives: ["Das Wetter prüfen", "Einen Treffpunkt vorschlagen", "Essen festlegen"]
            },
            bank_account: {
                title: "Ein Bankkonto eröffnen",
                description: "Erledigen Sie administrative Aufgaben bei einer Bank.",
                objectives: ["Grund des Besuchs erklären", "Nach Dokumenten fragen", "Nach Mobile-Banking-Funktionen fragen"]
            },
            environmental_meeting: {
                title: "Umwelt-Gemeindeversammlung",
                description: "Diskutieren Sie über die Reduzierung von Plastikmüll.",
                objectives: ["Für eine Maßnahme argumentieren", "Auf Kostenbedenken reagieren", "Einen Standpunkt zusammenfassen"]
            }
        }
    },
    [Language.ITALIAN]: {
        change_level: "Cambia Livello",
        scenarios_available: "Scenari Disponibili",
        exam_track: "Percorso d'Esame",
        level_beginner: "Principiante",
        level_elementary: "Elementare",
        level_intermediate: "Intermedio",
        level_upper_intermediate: "Intermedio Superiore",
        level_advanced: "Avanzato",
        level_mastery: "Padronanza",
        objectives_label: "Obiettivi",
        scenarios: {
            cafe_order: {
                title: "Ordinare al Caffè",
                description: "Ordina un caffè e una pasta in un bar locale.",
                objectives: ["Salutare il barista", "Ordinare una bevanda", "Ordinare cibo", "Chiedere il conto"]
            },
            directions: {
                title: "Chiedere Indicazioni",
                description: "Ti sei perso e devi trovare la stazione ferroviaria.",
                objectives: ["Scusarsi educatamente", "Chiedere dove si trova la stazione", "Ringraziare l'abitante del posto"]
            },
            doctor_visit: {
                title: "Dal Medico",
                description: "Spiega i tuoi sintomi a un medico.",
                objectives: ["Descrivere due sintomi", "Capire il consiglio del medico", "Chiedere dei medicinali"]
            },
            shopping_clothes: {
                title: "Acquistare Vestiti",
                description: "Trova un capo d'abbigliamento specifico in un negozio.",
                objectives: ["Chiedere un articolo specifico", "Discutere le taglie", "Chiedere il prezzo"]
            },
            job_interview: {
                title: "Colloquio di Lavoro",
                description: "Colloquio per un lavoro a tempo parziale.",
                objectives: ["Presentarsi professionalmente", "Descrivere le esperienze passate", "Fare una domanda sul ruolo"]
            },
            travel_complaint: {
                title: "Reclamo di Viaggio",
                description: "Fai un reclamo per un volo cancellato in aeroporto.",
                objectives: ["Spiegare il problema", "Chiedere rimborso o nuova prenotazione", "Chiedere di un hotel"]
            },
            apartment_dispute: {
                title: "Disputa sull'Appartamento",
                description: "Negozia le riparazioni con un proprietario difficile.",
                objectives: ["Descrivere il danno", "Argomentare la responsabilità del proprietario", "Concordare una data"]
            },
            cultural_debate: {
                title: "Dibattito sui Social Media",
                description: "Discuti l'impatto della tecnologia sulla società.",
                objectives: ["Esprimere un'opinione", "Fornire due motivi", "Rispondere a un contro-argomento"]
            },
            legal_consultation: {
                title: "Consulenza Legale",
                description: "Discuti un problema contrattuale complesso con un avvocato.",
                objectives: ["Spiegare la violazione", "Chiedere rimedi legali", "Discutere i possibili esiti"]
            },
            academic_seminar: {
                title: "Seminario Accademico",
                description: "Difendi un punto della tua tesi in un seminario.",
                objectives: ["Riassumere la posizione", "Citare prove ipotetiche", "Rispondere a una critica"]
            },
            philosophical_debate: {
                title: "Etica dell'IA",
                description: "Dibatti sulla natura della coscienza con un filosofo.",
                objectives: ["Definire un concetto astratto", "Usare metafore sofisticate", "Gestire ironia e sfumature"]
            },
            diplomatic_crisis: {
                title: "Negoziato Diplomatico",
                description: "Risolvi una disputa di confine tra due nazioni.",
                objectives: ["Esprimere preoccupazioni indirettamente", "Proporre un compromesso", "Mantenere il protocollo"]
            },
            pharmacy_visit: {
                title: "In Farmacia",
                description: "Descrivi i sintomi e chiedi dei medicinali.",
                objectives: ["Descrivere un sintomo chiaramente", "Chiedere il dosaggio", "Chiedere degli effetti collaterali"]
            },
            festival_volunteer: {
                title: "Volontario al Festival Locale",
                description: "Discuti i compiti durante un Matsuri locale.",
                objectives: ["Chiedere il proprio ruolo", "Confermare l'orario", "Navigare la gerarchia sociale"]
            },
            meeting_friend: {
                title: "Incontrare un Nuovo Amico",
                description: "Presentati in un parco.",
                objectives: ["Dire nome e provenienza", "Chiedere il nome dell'altro", "Congedarsi educatamente"]
            },
            planning_picnic: {
                title: "Pianificare un Picnic",
                description: "Coordina i piani per il fine settimana con un amico.",
                objectives: ["Controllare il meteo", "Suggerire un orario", "Decidere cosa mangiare"]
            },
            bank_account: {
                title: "Aprire un Conto Bancario",
                description: "Gestisci pratiche amministrative in banca.",
                objectives: ["Spiegare il motivo della visita", "Chiedere dei documenti", "Chiedere dell'app bancaria"]
            },
            environmental_meeting: {
                title: "Riunione Comunitaria Ambientale",
                description: "Discuti la riduzione dei rifiuti di plastica.",
                objectives: ["Argomentare per una politica", "Rispondere ai dubbi sui costi", "Riassumere un punto di vista"]
            }
        }
    },
    [Language.JAPANESE]: {
        change_level: "レベルを変更",
        scenarios_available: "利用可能なシナリオ",
        exam_track: "試験対策トラック",
        level_beginner: "初級",
        level_elementary: "初中級",
        level_intermediate: "中級",
        level_upper_intermediate: "中上級",
        level_advanced: "上級",
        level_mastery: "超級",
        objectives_label: "目標",
        scenarios: {
            cafe_order: {
                title: "カフェで注文する",
                description: "地元のカフェでコーヒーと菓子を注文します。",
                objectives: ["バリスタに挨拶する", "飲み物を注文する", "食べ物を注文する", "会計をお願いする"]
            },
            directions: {
                title: "道を尋ねる",
                description: "道に迷い、駅を見つける必要があります。",
                objectives: ["丁寧に声をかける", "駅の場所を尋ねる", "お礼を言う"]
            },
            doctor_visit: {
                title: "病院にて",
                description: "医師に症状を説明します。",
                objectives: ["2つの症状を説明する", "医師のアドバイスを理解する", "薬について尋ねる"]
            },
            shopping_clothes: {
                title: "服の買い物",
                description: "店で特定の衣類を探します。",
                objectives: ["特定のアイテムを尋ねる", "サイズについて相談する", "値段を尋ねる"]
            },
            job_interview: {
                title: "採用面接",
                description: "アルバイトの面接を受けます。",
                objectives: ["自己紹介をする", "過去の経験を説明する", "職務について質問する"]
            },
            travel_complaint: {
                title: "旅行の苦情",
                description: "空港で欠航便について苦情を伝えます。",
                objectives: ["問題を説明する", "返金または再予約を依頼する", "ホテルについて問い合わせる"]
            },
            apartment_dispute: {
                title: "アパートのトラブル",
                description: "気難しい大家と修理の交渉をします。",
                objectives: ["損害を説明する", "大家の責任を主張する", "修理の日程を決める"]
            },
            cultural_debate: {
                title: "ソーシャルメディアの討論",
                description: "テクノロジーが社会に与える影響について話し合います。",
                objectives: ["意見を述べる", "2つの根拠を提示する", "反対意見に反論する"]
            },
            legal_consultation: {
                title: "法律相談",
                description: "複雑な契約上の問題について弁護士と話し合います。",
                objectives: ["契約違反について説明する", "法的救済策を尋ねる", "可能性のある結果を議論する"]
            },
            academic_seminar: {
                title: "学術セミナー",
                description: "大学院のセミナーで論文のポイントを弁論します。",
                objectives: ["立場を要約する", "仮説的な証拠を引用する", "批判に回答する"]
            },
            philosophical_debate: {
                title: "AIの倫理",
                description: "哲学者と意識の本質について討論します。",
                objectives: ["抽象的な概念を定義する", "洗練された比喩を使う", "皮肉やニュアンスに対応する"]
            },
            diplomatic_crisis: {
                title: "外交交渉",
                description: "二国間の国境紛争を解決します。",
                objectives: ["国家の懸念を間接的に表明する", "複雑な妥協案を提示する", "外交儀礼を維持する"]
            },
            pharmacy_visit: {
                title: "薬局にて",
                description: "症状を説明し、薬を求めます。",
                objectives: ["症状を明確に伝える", "用法用量を尋ねる", "副作用について確認する"]
            },
            festival_volunteer: {
                title: "祭りボランティア",
                description: "地元の祭りで役割について話し合います。",
                objectives: ["特定の役割を尋ねる", "時間を確認する", "社会的な上下関係に対応する"]
            },
            meeting_friend: {
                title: "新しい友達に会う",
                description: "公園で自己紹介をします。",
                objectives: ["名前と出身を言う", "相手の名前を尋ねる", "丁寧に別れる"]
            },
            planning_picnic: {
                title: "ピクニックの計画",
                description: "友達と週末の計画を立てます。",
                objectives: ["天気を確認する", "集合時間を提案する", "持っていく食べ物を決める"]
            },
            bank_account: {
                title: "銀行口座の開設",
                description: "銀行で事務手続きを行います。",
                objectives: ["訪問の理由を説明する", "書類について尋ねる", "モバイル機能を確認する"]
            },
            environmental_meeting: {
                title: "環境住民会議",
                description: "プラスチックごみの削減について話し合います。",
                objectives: ["政策を主張する", "コストへの懸念に回答する", "見解を要約する"]
            }
        }
    },
    [Language.MANDARIN]: {
        change_level: "更改等级",
        scenarios_available: "可选场景",
        exam_track: "考试模式",
        level_beginner: "初级",
        level_elementary: "基础",
        level_intermediate: "中级",
        level_upper_intermediate: "中高级",
        level_advanced: "高级",
        level_mastery: "精通",
        objectives_label: "目标",
        scenarios: {
            cafe_order: {
                title: "在咖啡馆点餐",
                description: "在当地咖啡馆点一杯咖啡和一份点心。",
                objectives: ["向咖啡师问好", "点一杯饮料", "点食物", "买单"]
            },
            directions: {
                title: "问路",
                description: "你迷路了，需要找到火车站。",
                objectives: ["礼貌地打招呼", "询问火车站位置", "感谢当地人"]
            },
            doctor_visit: {
                title: "看医生",
                description: "向医生描述你的症状。",
                objectives: ["描述两个症状", "理解医生建议", "询问药物"]
            },
            shopping_clothes: {
                title: "买衣服",
                description: "在商店里寻找特定的衣物。",
                objectives: ["询问特定商品", "讨论尺寸", "询问价格"]
            },
            job_interview: {
                title: "求职面试",
                description: "面试一份兼职工作。",
                objectives: ["专业的自我介绍", "描述过去经验", "询问岗位问题"]
            },
            travel_complaint: {
                title: "旅行投诉",
                description: "在机场就取消的航班进行投诉。",
                objectives: ["解释问题", "要求退款或改签", "询问酒店"]
            },
            apartment_dispute: {
                title: "公寓纠纷",
                description: "与一位刁难的房东协商维修事宜。",
                objectives: ["描述损坏", "论证房东责任", "商定维修日期"]
            },
            cultural_debate: {
                title: "社交媒体辩论",
                description: "讨论技术对社会的影响。",
                objectives: ["发表观点", "提供两个理由", "反驳一个观点"]
            },
            legal_consultation: {
                title: "法律咨询",
                description: "与律师讨论复杂的合同问题。",
                objectives: ["解释违约情况", "询问法律补救", "讨论可能结果"]
            },
            academic_seminar: {
                title: "学术研讨会",
                description: "在研究生研讨会上辩论论文要点。",
                objectives: ["总结立场", "引用假设证据", "回应批评"]
            },
            philosophical_debate: {
                title: "人工智能伦理",
                description: "与哲学家辩论意识的本质。",
                objectives: ["定义抽象概念", "使用高深隐喻", "处理讽刺和细微差别"]
            },
            diplomatic_crisis: {
                title: "外交谈判",
                description: "解决两国之间的边界争端。",
                objectives: ["间接表达国家关切", "提出复杂妥协", "维持严格礼节"]
            },
            pharmacy_visit: {
                title: "在药店",
                description: "描述症状并购买药物。",
                objectives: ["清楚描述症状", "询问剂量", "咨询副作用"]
            },
            festival_volunteer: {
                title: "当地节日志愿者",
                description: "在当地祭典讨论职责。",
                objectives: ["询问具体角色", "确认活动时间", "礼貌处理等级关系"]
            },
            meeting_friend: {
                title: "结识新朋友",
                description: "在公园里自我介绍。",
                objectives: ["说出姓名和来源", "询问对方姓名", "礼貌道别"]
            },
            planning_picnic: {
                title: "计划野餐",
                description: "与朋友协调周末计划。",
                objectives: ["查看天气", "建议见面时间", "决定携带食物"]
            },
            bank_account: {
                title: "开设银行账户",
                description: "在银行处理行政事务。",
                objectives: ["解释访问原因", "询问所需文件", "咨询手机银行功能"]
            },
            environmental_meeting: {
                title: "环境社区会议",
                description: "讨论减少塑料浪费。",
                objectives: ["为政策辩护", "回应成本担忧", "总结复杂观点"]
            }
        }
    },
    [Language.RUSSIAN]: {
        change_level: "Сменить уровень",
        scenarios_available: "Доступные сценарии",
        exam_track: "Подготовка к экзаменам",
        level_beginner: "Начинающий",
        level_elementary: "Элементарный",
        level_intermediate: "Средний",
        level_upper_intermediate: "Выше среднего",
        level_advanced: "Продвинутый",
        level_mastery: "Профессиональный",
        objectives_label: "Цели",
        scenarios: {
            cafe_order: {
                title: "Заказ в кафе",
                description: "Закажите кофе и выпечку в местном кафе.",
                objectives: ["Поприветствовать бариста", "Заказать напиток", "Заказать еду", "Попросить счет"]
            },
            directions: {
                title: "Как пройти",
                description: "Вы заблудились и вам нужно найти вокзал.",
                objectives: ["Вежливо извиниться", "Спросить дорогу к вокзалу", "Поблагодарить прохожего"]
            },
            doctor_visit: {
                title: "У врача",
                description: "Объясните свои симптомы врачу.",
                objectives: ["Описать два симптома", "Понять совет врача", "Спросить о лекарстве"]
            },
            shopping_clothes: {
                title: "Покупка одежды",
                description: "Найдите конкретную вещь в магазине.",
                objectives: ["Попросить конкретный товар", "Обсудить размер", "Спросить о цене"]
            },
            job_interview: {
                title: "Собеседование",
                description: "Собеседование на подработку.",
                objectives: ["Профессионально представиться", "Описать прошлый опыт", "Задать вопрос о вакансии"]
            },
            travel_complaint: {
                title: "Жалоба в поездке",
                description: "Пожалуйтесь в аэропорту на отмененный рейс.",
                objectives: ["Объяснить проблему", "Попросить возврат или перенос", "Спросить об отеле"]
            },
            apartment_dispute: {
                title: "Спор по квартире",
                description: "Обсудите ремонт с трудным арендодателем.",
                objectives: ["Описать ущерб", "Обосновать ответственность хозяина", "Договориться о дате"]
            },
            cultural_debate: {
                title: "Дебаты о соцсетях",
                description: "Обсудите влияние технологий на общество.",
                objectives: ["Высказать мнение", "Привести два довода", "Ответить на контраргумент"]
            },
            legal_consultation: {
                title: "Юридическая консультация",
                description: "Обсудите сложный контрактный вопрос с адвокатом.",
                objectives: ["Объяснить нарушение контракта", "Спросить о правовой защите", "Обсудить исходы"]
            },
            academic_seminar: {
                title: "Академический семинар",
                description: "Защитите тезис на научном семинаре.",
                objectives: ["Обобщить свою позицию", "Привести гипотетические доказательства", "Ответить на критику"]
            },
            philosophical_debate: {
                title: "Этика ИИ",
                description: "Поспорьте с философом о природе сознания.",
                objectives: ["Определить абстрактное понятие", "Использовать метафоры", "Справляться с иронией"]
            },
            diplomatic_crisis: {
                title: "Дипломатические переговоры",
                description: "Разрешите пограничный спор между двумя странами.",
                objectives: ["Выразить опасения иносказательно", "Предложить компромисс", "Соблюдать протокол"]
            },
            pharmacy_visit: {
                title: "В аптеке",
                description: "Опишите симптомы и попросите лекарство.",
                objectives: ["Четко описать симптом", "Спросить о дозировке", "Узнать о побочных эффектах"]
            },
            festival_volunteer: {
                title: "Волонтер на фестивале",
                description: "Обсудите обязанности на местном празднике Мацури.",
                objectives: ["Спросить о конкретной роли", "Подтвердить время", "Вежливо соблюдать иерархию"]
            },
            meeting_friend: {
                title: "Встреча с новым другом",
                description: "Представьтесь в парке.",
                objectives: ["Назвать имя и происхождение", "Спросить имя собеседника", "Вежливо попрощаться"]
            },
            planning_picnic: {
                title: "Планирование пикника",
                description: "Скоординируйте планы на выходные с другом.",
                objectives: ["Проверить прогноз погоды", "Предложить время встречи", "Решить, какую еду взять"]
            },
            bank_account: {
                title: "Открытие банковского счета",
                description: "Решите административные задачи в банке.",
                objectives: ["Объяснить причину визита", "Спросить о документах", "Узнать о мобильном банке"]
            },
            environmental_meeting: {
                title: "Экологическое собрание",
                description: "Обсудите сокращение пластиковых отходов.",
                objectives: ["Аргументировать в пользу меры", "Ответить на опасения о стоимости", "Обобщить точку зрения"]
            }
        }
    },
    [Language.PORTUGUESE]: {
        change_level: "Mudar Nível",
        scenarios_available: "Cenários Disponíveis",
        exam_track: "Percurso de Exame",
        level_beginner: "Iniciante",
        level_elementary: "Elementar",
        level_intermediate: "Intermédio",
        level_upper_intermediate: "Pós-Intermédio",
        level_advanced: "Avançado",
        level_mastery: "Domínio",
        objectives_label: "Objetivos",
        scenarios: {
            cafe_order: {
                title: "Pedir num Café",
                description: "Peça um café e um bolo num café local.",
                objectives: ["Cumprimentar o barista", "Pedir uma bebida", "Pedir comida", "Pedir a conta"]
            },
            directions: {
                title: "Pedir Direções",
                description: "Está perdido e precisa de encontrar a estação de comboios.",
                objectives: ["Pedir desculpas educadamente", "Perguntar onde é a estação", "Agradecer ao habitante"]
            },
            doctor_visit: {
                title: "No Médico",
                description: "Explique os seus sintomas a um médico.",
                objectives: ["Descrever dois sintomas", "Entender o conselho do médico", "Perguntar sobre a medicação"]
            },
            shopping_clothes: {
                title: "Comprar Roupa",
                description: "Encontre uma peça de roupa específica numa loja.",
                objectives: ["Pedir um artigo específico", "Discutir tamanhos", "Perguntar o preço"]
            },
            job_interview: {
                title: "Entrevista de Emprego",
                description: "Entrevista para um trabalho em part-time.",
                objectives: ["Apresentar-se profissionalmente", "Descrever experiência passada", "Fazer uma pergunta sobre a função"]
            },
            travel_complaint: {
                title: "Reclamação de Viagem",
                description: "Reclame de um voo cancelado no aeroporto.",
                objectives: ["Explicar o problema", "Pedir reembolso ou nova reserva", "Perguntar sobre um hotel"]
            },
            apartment_dispute: {
                title: "Disputa de Apartamento",
                description: "Negocie reparações com um senhorio difícil.",
                objectives: ["Descrever o dano", "Argumentar a responsabilidade do senhorio", "Acordar uma data"]
            },
            cultural_debate: {
                title: "Debate sobre Redes Sociais",
                description: "Discuta o impacto da tecnologia na sociedade.",
                objectives: ["Expressar uma opinião", "Dar dois motivos", "Responder a um contra-argumento"]
            },
            legal_consultation: {
                title: "Consulta Jurídica",
                description: "Discuta um problema contratual complexo com um advogado.",
                objectives: ["Explicar a quebra de contrato", "Perguntar sobre recursos legais", "Discutir possíveis resultados"]
            },
            academic_seminar: {
                title: "Seminário Académico",
                description: "Defenda um ponto da sua tese num seminário de pós-graduação.",
                objectives: ["Resumir a sua posição", "Citar evidências hipotéticas", "Responder a uma crítica"]
            },
            philosophical_debate: {
                title: "Ética da IA",
                description: "Debata a natureza da consciência com um filósofo.",
                objectives: ["Definir um conceito abstrato", "Usar metáforas sofisticadas", "Lidar com ironia e nuances"]
            },
            diplomatic_crisis: {
                title: "Negociação Diplomática",
                description: "Resolva uma disputa de fronteira entre duas nações.",
                objectives: ["Expressar preocupações indiretamente", "Propor um compromisso", "Manter o protocolo"]
            },
            pharmacy_visit: {
                title: "Na Farmácia",
                description: "Descreva sintomas e peça medicamentos.",
                objectives: ["Descrever um sintoma claramente", "Perguntar sobre a dosagem", "Informar-se sobre efeitos secundários"]
            },
            festival_volunteer: {
                title: "Voluntário em Festival",
                description: "Discuta tarefas num Matsuri local.",
                objectives: ["Perguntar sobre a função específica", "Confirmar o horário", "Navegar a hierarquia social"]
            },
            meeting_friend: {
                title: "Conhecer um Novo Amigo",
                description: "Apresente-se num parque.",
                objectives: ["Dizer nome e origem", "Perguntar o nome do outro", "Despedir-se educadamente"]
            },
            planning_picnic: {
                title: "Planear um Piquenique",
                description: "Coordene os planos do fim de semana com um amigo.",
                objectives: ["Verificar o tempo", "Sugerir uma hora", "Decidir a comida"]
            },
            bank_account: {
                title: "Abrir uma Conta Bancária",
                description: "Faça tarefas administrativas num banco.",
                objectives: ["Explicar o motivo da visita", "Perguntar pelos documentos", "Consultar funções de homebanking"]
            },
            environmental_meeting: {
                title: "Reunião Comunitária Ambiental",
                description: "Discuta a redução de resíduos plásticos.",
                objectives: ["Argumentar a favor de uma política", "Responder a preocupações de custo", "Resumir um ponto de vista"]
            }
        }
    },
    [Language.UKRAINIAN]: {
        change_level: "Змінити рівень",
        scenarios_available: "Доступні сценарії",
        exam_track: "Підготовка до іспитів",
        level_beginner: "Початківець",
        level_elementary: "Елементарний",
        level_intermediate: "Середній",
        level_upper_intermediate: "Вище середнього",
        level_advanced: "Просунутий",
        level_mastery: "Досконалий",
        objectives_label: "Цілі",
        scenarios: {
            cafe_order: {
                title: "Замовлення в кафе",
                description: "Замовте каву та випічку в місцевій кав'ярні.",
                objectives: ["Привітати бариста", "Замовити напій", "Замовити їжу", "Попросити рахунок"]
            },
            directions: {
                title: "Як пройти",
                description: "Ви заблукали і вам потрібно знайти вокзал.",
                objectives: ["Ввічливо вибачитися", "Запитати дорогу до вокзалу", "Подякувати перехожому"]
            },
            doctor_visit: {
                title: "У лікаря",
                description: "Поясніть свої симптоми лікарю.",
                objectives: ["Описати два симптоми", "Зрозуміти пораду лікаря", "Запитати про ліки"]
            },
            shopping_clothes: {
                title: "Купівля одягу",
                description: "Знайдіть конкретну річ у магазині.",
                objectives: ["Попросити конкретний товар", "Обговорити розмір", "Запитати про ціну"]
            },
            job_interview: {
                title: "Співбесіда",
                description: "Співбесіда на підробіток.",
                objectives: ["Професійно представитися", "Описати минулий досвід", "Задати питання про вакансію"]
            },
            travel_complaint: {
                title: "Скарга в поїздці",
                description: "Поскаржтеся в аеропорту на скасований рейс.",
                objectives: ["Пояснити проблему", "Попросити повернення або перенесення", "Запитати про готель"]
            },
            apartment_dispute: {
                title: "Суперечка за квартиру",
                description: "Обговоріть ремонт із важким орендодавцем.",
                objectives: ["Описати пошкодження", "Обґрунтувати відповідальність господаря", "Домовитися про дату"]
            },
            cultural_debate: {
                title: "Дебати про соцмережі",
                description: "Обговоріть вплив технологій на суспільство.",
                objectives: ["Висловити думку", "Навести два аргументи", "Відповісти на контраргумент"]
            },
            legal_consultation: {
                title: "Юридична консультація",
                description: "Обговоріть складне контрактне питання з адвокатом.",
                objectives: ["Пояснити порушення контракту", "Запитати про правовий захист", "Обговорити результати"]
            },
            academic_seminar: {
                title: "Академічний семінар",
                description: "Захистіть тезу на науковому семінарі.",
                objectives: ["Узагальнити свою позицію", "Навести гіпотетичні докази", "Відповісти на критику"]
            },
            philosophical_debate: {
                title: "Етика ШІ",
                description: "Посперечайтеся з філософом про природу свідомості.",
                objectives: ["Визначити абстрактне поняття", "Використовути метафори", "Впоратися з іронією"]
            },
            diplomatic_crisis: {
                title: "Дипломатичні переговори",
                description: "Вирішіть прикордонну суперечку між двома країнами.",
                objectives: ["Висловити побоювання інакомовно", "Запропонувати компроміс", "Дотримуватися протоколу"]
            },
            pharmacy_visit: {
                title: "В аптеці",
                description: "Опишіть симптоми та попросіть ліки.",
                objectives: ["Чітко описати симптом", "Запитати про дозування", "Дізнатися про побічні ефекти"]
            },
            festival_volunteer: {
                title: "Волонтер на фестивалі",
                description: "Обговоріть обов'язки на місцевому святі Мацурі.",
                objectives: ["Запитати про конкретну роль", "Підтвердити час", "Ввічливо дотримуватися ієрархії"]
            },
            meeting_friend: {
                title: "Зустріч із новим другом",
                description: "Представтеся в парку.",
                objectives: ["Назвати ім'я та походження", "Запитати ім'я співрозмовника", "Ввічливо попрощатися"]
            },
            planning_picnic: {
                title: "Планування пікніка",
                description: "Скоординуйте плани на вихідні з другом.",
                objectives: ["Перевірити прогноз погоди", "Запропонувати час зустрічі", "Вирішити, яку їжу взяти"]
            },
            bank_account: {
                title: "Відкриття банківського рахунку",
                description: "Вирішіть адміністративні завдання в банку.",
                objectives: ["Пояснити причину візиту", "Запитати про документи", "Дізнатися про мобільний банк"]
            },
            environmental_meeting: {
                title: "Екологічні збори",
                description: "Обговоріть скорочення пластикових відходів.",
                objectives: ["Аргументувати на користь заходу", "Відповісти на побоювання щодо вартості", "Узагальнити точку зору"]
            }
        }
    },
    [Language.POLISH]: {
        change_level: "Zmień poziom",
        scenarios_available: "Dostępne scenariusze",
        exam_track: "Ścieżka egzaminacyjna",
        level_beginner: "Początkujący",
        level_elementary: "Podstawowy",
        level_intermediate: "Średniozaawansowany",
        level_upper_intermediate: "Wyższy średniozaawansowany",
        level_advanced: "Zaawansowany",
        level_mastery: "Biegły",
        objectives_label: "Cele",
        scenarios: {
            cafe_order: {
                title: "Zamawianie w kawiarni",
                description: "Zamów kawę i ciastko w lokalnej kawiarni.",
                objectives: ["Przywitaj się z baristą", "Zamów napój", "Zamów jedzenie", "Poproś o rachunek"]
            },
            directions: {
                title: "Pytanie o drogę",
                description: "Zgubiłeś się i musisz znaleźć stację kolejową.",
                objectives: ["Uprzejmie przeproś", "Zapytaj o drogę do stacji", "Podziękuj przechodniowi"]
            },
            doctor_visit: {
                title: "U lekarza",
                description: "Wyjaśnij swoje objawy lekarzowi.",
                objectives: ["Opisz dwa objawy", "Zrozum poradę lekarza", "Zapytaj o leki"]
            },
            shopping_clothes: {
                title: "Kupowanie ubrań",
                description: "Znajdź konkretny produkt w sklepie.",
                objectives: ["Poproś o konkretny towar", "Omów rozmiar", "Zapytaj o cenę"]
            },
            job_interview: {
                title: "Rozmowa o pracę",
                description: "Rozmowa o pracę na pół etatu.",
                objectives: ["Przedstaw się profesjonalnie", "Opisz przeszłe doświadczenie", "Zadaj pytanie o stanowisko"]
            },
            travel_complaint: {
                title: "Reklamacja podróży",
                description: "Złóż reklamację na lotnisku z powodu odwołanego lotu.",
                objectives: ["Wyjaśnij problem", "Poproś o zwrot lub przebukowanie", "Zapytaj o hotel"]
            },
            apartment_dispute: {
                title: "Spór o mieszkanie",
                description: "Negocjuj naprawy z trudnym właścicielem.",
                objectives: ["Opisz uszkodzenie", "Uzasadnij odpowiedzialność właściciela", "Ustal datę"]
            },
            cultural_debate: {
                title: "Debata o mediach społecznościowych",
                description: "Podyskutuj o wpływie technologii na społeczeństwo.",
                objectives: ["Wyraź opinię", "Podaj dwa powody", "Odpowiedz na kontrargument"]
            },
            legal_consultation: {
                title: "Konsultacja prawna",
                description: "Omów złożony problem kontraktowy z prawnikiem.",
                objectives: ["Wyjaśnij naruszenie umowy", "Zapytaj o środki prawne", "Omów wyniki"]
            },
            academic_seminar: {
                title: "Seminarium akademickie",
                description: "Broń punktu swojej tezy na seminarium dyplomowym.",
                objectives: ["Podsumuj swoje stanowisko", "Przytocz dowody hipotetyczne", "Odpowiedz na krytykę"]
            },
            philosophical_debate: {
                title: "Etyka SI",
                description: "Debatuj o naturze świadomości z filozofem.",
                objectives: ["Zdefiniuj pojęcie abstrakcyjne", "Użyj metafor", "Radź sobie z ironią"]
            },
            diplomatic_crisis: {
                title: "Negocjacje dyplomatyczne",
                description: "Rozwiąż spór graniczny między dwoma narodami.",
                objectives: ["Wyraź obawy pośrednio", "Zaproponuj kompromis", "Zachowaj protokół"]
            },
            pharmacy_visit: {
                title: "W aptece",
                description: "Opisz objawy i poproś o leki.",
                objectives: ["Jasno opisz objaw", "Zapytaj o dawkowanie", "Zapytaj o skutki uboczne"]
            },
            festival_volunteer: {
                title: "Wolontariusz na festiwalu",
                description: "Omów obowiązki podczas lokalnego Matsuri.",
                objectives: ["Zapytaj o konkretną rolę", "Potwierdź czas", "Uprzejmie przestrzegaj hierarchii"]
            },
            meeting_friend: {
                title: "Spotkanie nowego znajomego",
                description: "Przedstaw się w parku.",
                objectives: ["Podaj imię i pochodzenie", "Zapytaj o imię drugiej osoby", "Uprzejmie się pożegnaj"]
            },
            planning_picnic: {
                title: "Planowanie pikniku",
                description: "Skoordynuj plany na weekend ze znajomym.",
                objectives: ["Sprawdź pogodę", "Zasugeruj godzinę spotkania", "Zdecyduj o jedzeniu"]
            },
            bank_account: {
                title: "Otwieranie konta bankowego",
                description: "Załatw sprawy administracyjne w banku.",
                objectives: ["Wyjaśnij powód wizyty", "Zapytaj o dokumenty", "Zapytaj o funkcje mobilne"]
            },
            environmental_meeting: {
                title: "Ekologiczne spotkanie wspólnoty",
                description: "Podyskutuj o redukcji odpadów plastikowych.",
                objectives: ["Argumentuj za danym rozwiązaniem", "Odpowiedz na obawy o koszty", "Podsumuj punkt widzenia"]
            }
        }
    },
    [Language.CZECH]: {
        change_level: "Změnit úroveň",
        scenarios_available: "Dostupné scénáře",
        exam_track: "Zkoušková trasa",
        level_beginner: "Začátečník",
        level_elementary: "Mírně pokročilý",
        level_intermediate: "Středně pokročilý",
        level_upper_intermediate: "Vyšší středně pokročilý",
        level_advanced: "Pokročilý",
        level_mastery: "Mistrovský",
        objectives_label: "Cíle",
        scenarios: {
            cafe_order: {
                title: "Objednávání v kavárně",
                description: "Objednejte si kávu a pečivo v místní kavárně.",
                objectives: ["Pozdravit baristu", "Objednat si nápoj", "Objednat si jídlo", "Požádat o účet"]
            },
            directions: {
                title: "Ptaní se na cestu",
                description: "Ztratili jste se a potřebujete najít vlakové nádraží.",
                objectives: ["Slušně se omluvit", "Zeptat se na cestu k nádraží", "Poděkovat kolejdoucímu"]
            },
            doctor_visit: {
                title: "U lékaře",
                description: "Vysvětlete své příznaky lékaři.",
                objectives: ["Popsat dva příznaky", "Rozumět radě lékaře", "Zeptat se na léky"]
            },
            shopping_clothes: {
                title: "Nakupování oblečení",
                description: "Najděte konkrétní kus oblečení v obchodě.",
                objectives: ["Požádat o konkrétní zboží", "Prodiskutovat velikost", "Zeptat se na cenu"]
            },
            job_interview: {
                title: "Pracovní pohovor",
                description: "Pohovor na brigádu.",
                objectives: ["Profesionálně se představit", "Popsat minulou zkušenost", "Položit otázku k pozici"]
            },
            travel_complaint: {
                title: "Stížnost na cestu",
                description: "Stěžujte si na letišti na zrušený let.",
                objectives: ["Vysvětlit problém", "Požádat o vrácení nebo přerezervování", "Zeptat se na hotel"]
            },
            apartment_dispute: {
                title: "Spor o byt",
                description: "Vyjednejte opravy s obtížným pronajímatelem.",
                objectives: ["Popsat poškození", "Zdůvodnit odpovědnost pronajímatele", "Dohodnout se na datu"]
            },
            cultural_debate: {
                title: "Debata o sociálních médiích",
                description: "Diskutujte o vlivu technologií na společnost.",
                objectives: ["Vyjádřit názor", "Uvést dva důvody", "Odpovědět na protiargument"]
            },
            legal_consultation: {
                title: "Právní konzultace",
                description: "Prodiskutujte složitý smluvní problém s právníkem.",
                objectives: ["Vysvětlit porušení smlouvy", "Zeptat se na právní prostředky", "Prodiskutovat výsledky"]
            },
            academic_seminar: {
                title: "Akademický seminář",
                description: "Obhajujte bod své teze v postgraduálním semináři.",
                objectives: ["Shrnout svůj postoj", "Citovat hypotetické důkazy", "Reagovat na kritiku"]
            },
            philosophical_debate: {
                title: "Etika AI",
                description: "Debatujte o povaze vědomí s filozofem.",
                objectives: ["Definovat abstraktní pojem", "Použít metafory", "Zvládat ironii"]
            },
            diplomatic_crisis: {
                title: "Diplomatické vyjednávání",
                description: "Vyřešte hraniční spor mezi dvěma národy.",
                objectives: ["Vyjádřit obavy nepřímo", "Navrhnout kompromis", "Dodržovat protokol"]
            },
            pharmacy_visit: {
                title: "V lékárně",
                description: "Popište příznaky a požádejte o léky.",
                objectives: ["Jasně popsat příznak", "Zeptat se na dávkování", "Zeptat se na vedlejší účinky"]
            },
            festival_volunteer: {
                title: "Dobrovolník na festivalu",
                description: "Prodiskutujte úkoly na místním Matsuri.",
                objectives: ["Zeptat se na konkrétní roli", "Potvrdit čas", "Slušně dodržovat hierarchii"]
            },
            meeting_friend: {
                title: "Setkání s novým přítelem",
                description: "Představte se v parku.",
                objectives: ["Uvést jméno a původ", "Zeptat se na jméno druhého", "Slušně se rozloučit"]
            },
            planning_picnic: {
                title: "Plánování pikniku",
                description: "Skoordinujte plány na víkend s přítelem.",
                objectives: ["Zkontrolovat počasí", "Navrhnout čas setkání", "Rozhodnout o jídle"]
            },
            bank_account: {
                title: "Otevření bankovního účtu",
                description: "Vyřiďte administrativní úkoly v bance.",
                objectives: ["Vysvětlit důvod návštěvy", "Zeptat se na dokumenty", "Zeptat se na mobilní funkce"]
            },
            environmental_meeting: {
                title: "Ekologické setkání komunity",
                description: "Diskutujte o snižování plastového odpadu.",
                objectives: ["Argumentovat pro dané opatření", "Reagovat na obavy o cenu", "Shrnout pohled"]
            }
        }
    },
    [Language.DUTCH]: {
        change_level: "Niveau wijzigen",
        scenarios_available: "Beschikbare scenario's",
        exam_track: "Examentraject",
        level_beginner: "Beginner",
        level_elementary: "Basis",
        level_intermediate: "Gemiddeld",
        level_upper_intermediate: "Bovengemiddeld",
        level_advanced: "Gevorderd",
        level_mastery: "Vloeiend",
        objectives_label: "Doelen",
        scenarios: {
            cafe_order: {
                title: "Bestellen in een café",
                description: "Bestel een koffie en een gebakje in een plaatselijk café.",
                objectives: ["Begroet de barista", "Bestel een drankje", "Bestel eten", "Vraag om de rekening"]
            },
            directions: {
                title: "De weg vragen",
                description: "Je bent de weg kwijt en moet het treinstation vinden.",
                objectives: ["Excuseer je beleefd", "Vraag de weg naar het station", "Bedank de voorbijganger"]
            },
            doctor_visit: {
                title: "Bij de dokter",
                description: "Leg je symptomen uit aan een arts.",
                objectives: ["Beschrijf twee symptomen", "Begrijp het advies van de dokter", "Vraag naar medicijnen"]
            },
            shopping_clothes: {
                title: "Kleding kopen",
                description: "Vind een specifiek kledingstuk in een winkel.",
                objectives: ["Vraag naar een specifiek artikel", "Bespreek de maat", "Vraag naar de prijs"]
            },
            job_interview: {
                title: "Sollicitatiegesprek",
                description: "Gesprek voor een bijbaan.",
                objectives: ["Stel jezelf professioneel voor", "Beschrijf eerdere ervaring", "Stel een vraag over de functie"]
            },
            travel_complaint: {
                title: "Reisklacht",
                description: "Dien een klacht in op de luchthaven over een geannuleerde vlucht.",
                objectives: ["Leg het probleem uit", "Vraag om terugbetaling of omboeking", "Vraag naar een hotel"]
            },
            apartment_dispute: {
                title: "Conflict over woning",
                description: "Onderhandel over reparaties met een lastige huisbaas.",
                objectives: ["Beschrijf de schade", "Motiveer de verantwoordelijkheid van de huisbaas", "Spreek een datum af"]
            },
            cultural_debate: {
                title: "Social media debat",
                description: "Discussieer over de impact van technologie op de samenleving.",
                objectives: ["Geef je mening", "Geef twee redenen", "Reageer op een tegenargument"]
            },
            legal_consultation: {
                title: "Juridisch advies",
                description: "Bespreek een complex contractprobleem met een advocaat.",
                objectives: ["Leg de contractbreuk uit", "Vraag naar juridische stappen", "Bespreek de uitkomsten"]
            },
            academic_seminar: {
                title: "Academisch seminar",
                description: "Verdedig een stelling in een wetenschappelijk seminar.",
                objectives: ["Vat je standpunt samen", "Citeer hypothetisch bewijs", "Reageer op kritiek"]
            },
            philosophical_debate: {
                title: "Ethiek van AI",
                description: "Debatteer over de aard van het bewustzijn met een filosoof.",
                objectives: ["Definieer een abstract concept", "Gebruik metaforen", "Ga om met ironie"]
            },
            diplomatic_crisis: {
                title: "Diplomatieke onderhandeling",
                description: "Los een grensconflict op tussen twee landen.",
                objectives: ["Uite zorgen indirect", "Stel een compromis voor", "Houd je aan het protocol"]
            },
            pharmacy_visit: {
                title: "Bij de apotheek",
                description: "Beschrijf symptomen en vraag om medicijnen.",
                objectives: ["Beschrijf een symptoom duidelijk", "Vraag naar de dosering", "Vraag naar bijwerkingen"]
            },
            festival_volunteer: {
                title: "Vrijwilliger op festival",
                description: "Bespreek taken tijdens een lokaal Matsuri.",
                objectives: ["Vraag naar je specifieke rol", "Bevestig de tijd", "Houd je beleefd aan de hiërarchie"]
            },
            meeting_friend: {
                title: "Een nieuwe vriend ontmoeten",
                description: "Stel jezelf voor in een park.",
                objectives: ["Noem naam en herkomst", "Vraag naar de naam van de ander", "Neem beleefd afscheid"]
            },
            planning_picnic: {
                title: "Een picknick plannen",
                description: "Coördineer weekendplannen met een vriend.",
                objectives: ["Check het weer", "Stel een tijd voor", "Beslis over het eten"]
            },
            bank_account: {
                title: "Bankrekening openen",
                description: "Regel administratieve zaken bij een bank.",
                objectives: ["Leg de reden van het bezoek uit", "Vraag naar documenten", "Vraag naar mobiele functies"]
            },
            environmental_meeting: {
                title: "Milieubijeenkomst",
                description: "Discussieer over het verminderen van plastic afval.",
                objectives: ["Argumenteer voor een maatregel", "Reageer op zorgen over de kosten", "Vat een standpunt samen"]
            }
        }
    }
};
