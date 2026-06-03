import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;
let useSimulator = false;

export function initAI(apiKey) {
    const cleanKey = (apiKey || '').trim();
    if (!cleanKey || cleanKey === 'YOUR_GEMINI_API_KEY_HERE') {
        useSimulator = true;
        console.log('🤖 Synapsia: Avvio in MODALITÀ SIMULATA (nessuna chiave API valida fornita).');
        return;
    }
    try {
        genAI = new GoogleGenerativeAI(cleanKey);
        model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            generationConfig: { responseMimeType: 'application/json' }
        });
        useSimulator = false;
        console.log('✨ Synapsia: Connessione a Google Gemini AI inizializzata con modello gemini-2.5-flash.');
    } catch (err) {
        console.error('⚠️ Impossibile inizializzare Gemini API. Modulo simulato attivo.', err);
        useSimulator = true;
    }
}

// ===== SIMULATION DATA TEMPLATES =====
const PSYCHOLOGY_MAP = {
    macroTopics: ["Processi Cognitivi", "Sistemi di Memoria"],
    nodes: [
        { id: "psicologia_cognitiva", label: "Psicologia Cognitiva", macroTopic: "Processi Cognitivi", type: "hub", abstractionLevel: 5, description: "Lo studio scientifico della mente e dei processi cognitivi, quali percezione, attenzione e memoria." },
        { id: "attenzione", label: "Attenzione Selettiva", macroTopic: "Processi Cognitivi", type: "intermediate", abstractionLevel: 3, description: "Il processo di selezione di alcune informazioni a scapito di altre presenti nell'ambiente." },
        { id: "effetto_stroop", label: "Effetto Stroop", macroTopic: "Processi Cognitivi", type: "leaf", abstractionLevel: 1, description: "Esempio sperimentale di interferenza cognitiva automatica causato dal colore e dal testo di una parola." },
        { id: "percezione", label: "Percezione Sensoriale", macroTopic: "Processi Cognitivi", type: "intermediate", abstractionLevel: 3, description: "L'elaborazione e interpretazione attiva degli stimoli sensoriali provenienti dall'esterno." },
        { id: "gestalt", label: "Psicologia della Gestalt", macroTopic: "Processi Cognitivi", type: "leaf", abstractionLevel: 2, description: "Scuola psicologica che studia la percezione basandosi sul principio del 'tutto è più della somma delle singole parti'." },
        { id: "memoria", label: "Sistemi di Memoria", macroTopic: "Sistemi di Memoria", type: "hub", abstractionLevel: 5, description: "La capacità di codificare, immagazzinare e recuperare informazioni nel tempo." },
        { id: "memoria_breve", label: "Memoria a Breve Termine", macroTopic: "Sistemi di Memoria", type: "intermediate", abstractionLevel: 3, description: "Sistema a capacità limitata in grado di conservare informazioni per circa 15-30 secondi." },
        { id: "working_memory", label: "Memoria di Lavoro", macroTopic: "Sistemi di Memoria", type: "intermediate", abstractionLevel: 4, description: "Sistema per il mantenimento temporaneo e la manipolazione attiva delle informazioni durante compiti cognitivi complessi." },
        { id: "memoria_lungo", label: "Memoria a Lungo Termine", macroTopic: "Sistemi di Memoria", type: "intermediate", abstractionLevel: 3, description: "Archivio a capacità teoricamente illimitata in cui le informazioni vengono conservate per lunghi periodi." },
        { id: "memoria_dichiarativa", label: "Memoria Dichiarativa", macroTopic: "Sistemi di Memoria", type: "leaf", abstractionLevel: 2, description: "Sotto-sistema della memoria a lungo termine che riguarda i fatti ed eventi che possono essere descritti a parole." }
    ],
    edges: [
        { from: "psicologia_cognitiva", to: "attenzione", type: "intra", description: "L'attenzione è uno dei principali processi cognitivi indagati." },
        { from: "attenzione", to: "effetto_stroop", type: "intra", description: "L'effetto Stroop misura l'attenzione selettiva e il controllo inibitorio." },
        { from: "psicologia_cognitiva", to: "percezione", type: "intra", description: "La percezione è la porta d'accesso per gli stimoli all'attenzione." },
        { from: "percezione", to: "gestalt", type: "intra", description: "La Gestalt fornisce leggi fondamentali sull'organizzazione percettiva." },
        { from: "psicologia_cognitiva", to: "memoria", type: "inter", description: "La cognizione si appoggia strutturalmente sui sistemi di memoria." },
        { from: "memoria", to: "memoria_breve", type: "intra", description: "La memoria a breve termine rappresenta la prima ritenzione cosciente." },
        { from: "memoria_breve", to: "working_memory", type: "intra", description: "La working memory evolve il concetto di memoria a breve termine rendendola attiva." },
        { from: "memoria", to: "memoria_lungo", type: "intra", description: "La memoria a lungo termine è il magazzino in cui i dati vengono consolidati." },
        { from: "memoria_lungo", to: "memoria_dichiarativa", type: "intra", description: "La memoria dichiarativa è la branca conscia della memoria a lungo termine." },
        { from: "attenzione", to: "working_memory", type: "inter", description: "L'attenzione seleziona ciò che entra ed è manipolato nella working memory." }
    ]
};

const PHILOSOPHY_MAP = {
    macroTopics: ["Antica Grecia", "Critica Kantiana"],
    nodes: [
        { id: "filosofia", label: "Origine della Filosofia", macroTopic: "Antica Grecia", type: "hub", abstractionLevel: 5, description: "Il passaggio dal mito (mythos) al ragionamento logico (logos) nell'Antica Grecia." },
        { id: "socrate", label: "Socrate e la Maieutica", macroTopic: "Antica Grecia", type: "intermediate", abstractionLevel: 4, description: "Il metodo dialettico socratico volto a 'far partorire' la verità all'interlocutore tramite domande." },
        { id: "platone", label: "Platone e le Idee", macroTopic: "Antica Grecia", type: "intermediate", abstractionLevel: 4, description: "La teoria del mondo delle idee iperuranio, modello perfetto e intelligibile del mondo sensibile." },
        { id: "mito_caverna", label: "Mito della Caverna", macroTopic: "Antica Grecia", type: "leaf", abstractionLevel: 1, description: "Allegoria platonica che rappresenta il cammino del filosofo dall'oscurità dell'opinione alla luce del bene." },
        { id: "kant", label: "Criticismo Kantiano", macroTopic: "Critica Kantiana", type: "hub", abstractionLevel: 5, description: "Il pensiero di Immanuel Kant che indaga le condizioni di possibilità, i limiti e la validità della conoscenza." },
        { id: "ragion_pura", label: "Critica della Ragion Pura", macroTopic: "Critica Kantiana", type: "intermediate", abstractionLevel: 4, description: "Opera di Kant che unisce razionalismo ed empirismo attraverso i giudizi sintetici a priori." },
        { id: "fenomeno_noumeno", label: "Fenomeno e Noumeno", macroTopic: "Critica Kantiana", type: "leaf", abstractionLevel: 2, description: "La distinzione kantiana tra ciò che appare all'intelletto filtrato dalle forme pure (fenomeno) e la cosa in sé (noumeno)." }
    ],
    edges: [
        { from: "filosofia", to: "socrate", type: "intra", description: "Socrate avvia la filosofia antropologica e la ricerca etica." },
        { from: "socrate", to: "platone", type: "intra", description: "Platone è discepolo di Socrate e ne codifica la dottrina scrivendo i dialoghi." },
        { from: "platone", to: "mito_caverna", type: "intra", description: "Il mito illustra in forma allegorica la dottrina platonica delle idee." },
        { from: "socrate", to: "kant", type: "inter", description: "La critica di Kant richiama l'imperativo socratico dell'esame razionale di sé." },
        { from: "kant", to: "ragion_pura", type: "intra", description: "La Ragion Pura è l'opera fondamentale in cui si realizza la rivoluzione copernicana di Kant." },
        { from: "ragion_pura", to: "fenomeno_noumeno", type: "intra", description: "Il noumeno emerge come limite strutturale stabilito nella Critica." }
    ]
};

// Generate dynamic map from uploaded text
function generateDynamicMap(text, projectName = "Nuovo Progetto") {
    const cleanText = text.replace(/\s+/g, ' ');
    const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);

    const macroTopics = ["Fondamenti", "Struttura ed Esempi"];
    const nodes = [];
    const edges = [];

    // Helper to find paragraphs/sentences with key terms
    const getSentenceFor = (keyword) => {
        const found = sentences.find(s => s.toLowerCase().includes(keyword.toLowerCase()));
        return found ? found.substring(0, 150) + "..." : "";
    };

    // Find some capitalized words as concepts
    const words = cleanText.match(/\b[A-Z][a-zA-Z]{4,}\b/g) || [];
    const uniqueWords = Array.from(new Set(words)).filter(w => !["Questo", "Quindi", "Perché", "Inoltre", "Tuttavia", "Siamo"].includes(w));

    const concepts = uniqueWords.slice(0, 7);
    if (concepts.length < 4) {
        concepts.push("Concetto Fondamentale", "Struttura Logica", "Applicazione Pratica", "Caso di Studio");
    }

    // Build concepts
    concepts.forEach((concept, idx) => {
        let type = "intermediate";
        let level = 3;
        let topic = macroTopics[0];

        if (idx === 0) {
            type = "hub";
            level = 5;
            topic = macroTopics[0];
        } else if (idx === 1 || idx === 4) {
            type = "hub";
            level = 5;
            topic = macroTopics[1];
        } else if (idx === concepts.length - 1 || idx === concepts.length - 2) {
            type = "leaf";
            level = 1;
            topic = macroTopics[1];
        }

        const sentence = getSentenceFor(concept) || `Definizione del concetto di ${concept} estratto dal materiale del corso.`;

        nodes.push({
            id: `concept_${idx}`,
            label: concept,
            macroTopic: topic,
            type,
            abstractionLevel: level,
            description: sentence
        });
    });

    // Build relationships
    for (let i = 0; i < nodes.length - 1; i++) {
        edges.push({
            from: nodes[i].id,
            to: nodes[i + 1].id,
            type: nodes[i].macroTopic === nodes[i + 1].macroTopic ? "intra" : "inter",
            description: `Collegamento logico tra ${nodes[i].label} e ${nodes[i+1].label}.`
        });
    }

    if (nodes.length > 3) {
        edges.push({
            from: nodes[0].id,
            to: nodes[3].id,
            type: "inter",
            description: `Correlazione trasversale tra ${nodes[0].label} e ${nodes[3].label}.`
        });
    }

    return { macroTopics, nodes, edges };
}

/**
 * Analyze text content and generate a concept map (nodes + edges).
 */
export async function analyzeContent(textContent) {
    if (useSimulator) {
        const textLower = textContent.toLowerCase();
        if (textLower.includes('psicologia') || textLower.includes('memoria') || textLower.includes('cognitiva')) {
            return JSON.parse(JSON.stringify(PSYCHOLOGY_MAP));
        } else if (textLower.includes('filosofia') || textLower.includes('kant') || textLower.includes('socrate')) {
            return JSON.parse(JSON.stringify(PHILOSOPHY_MAP));
        }
        return generateDynamicMap(textContent);
    }

    try {
        const prompt = `Sei un assistente accademico esperto. Analizza il seguente materiale di studio e crea una mappa concettuale strutturata.

REGOLE:
- Identifica i MACRO-ARGOMENTI (saranno i livelli/capitoli, asse Z)
- Per ogni macro-argomento, identifica i concetti PRINCIPALI (hub), INTERMEDI e DETTAGLI (foglie)
- I concetti hub hanno alto livello di astrazione (asse Y alto), i dettagli hanno asse Y basso
- Identifica RELAZIONI intra-capitolo e inter-capitolo
- Per ogni nodo, indica il numero di connessioni (asse X = ampiezza relazionale)

Rispondi ESCLUSIVAMENTE con un JSON valido in questo formato:
{
  "macroTopics": ["argomento1", "argomento2"],
  "nodes": [
    {"id": "unique_id", "label": "Nome Concetto", "macroTopic": "argomento1", "type": "hub|intermediate|leaf", "abstractionLevel": 1-5, "description": "breve descrizione"}
  ],
  "edges": [
    {"from": "id1", "to": "id2", "type": "intra|inter", "description": "descrizione relazione"}
  ]
}

MATERIALE:
${textContent.substring(0, 15000)}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI did not return valid JSON');

        return JSON.parse(jsonMatch[0]);
    } catch (err) {
        console.error('Errore chiamata API Gemini, attivo simulatore temporaneo:', err.message);
        const textLower = textContent.toLowerCase();
        if (textLower.includes('psicologia') || textLower.includes('memoria') || textLower.includes('cognitiva')) {
            return JSON.parse(JSON.stringify(PSYCHOLOGY_MAP));
        } else if (textLower.includes('filosofia') || textLower.includes('kant') || textLower.includes('socrate')) {
            return JSON.parse(JSON.stringify(PHILOSOPHY_MAP));
        }
        return generateDynamicMap(textContent);
    }
}

/**
 * Generate a study question for a specific node.
 */
export async function generateQuestion(node, previousNodes, macroTopic) {
    if (useSimulator) {
        const isFirst = previousNodes.length === 0;
        let introduction = "";
        let question = "";

        if (isFirst) {
            introduction = `Iniziamo a esplorare il territorio! Siamo nel macro-argomento "${macroTopic}".`;
            question = `Per gettare le basi del nostro cantiere cognitivo, come definiresti il concetto di "${node.label}"? Spiegalo con parole tue.`;
        } else {
            const prevLabels = previousNodes.slice(-2).map(n => n.label).join(' e ');
            introduction = `Molto bene. Abbiamo già messo a fuoco ${prevLabels}. Proseguiamo.`;
            question = `Ora focalizziamoci su "${node.label}" (${node.description ? 'descritto nel materiale come: ' + node.description : 'un elemento chiave'}). Come si collega secondo te a quello che abbiamo appena visto? Qual è il suo ruolo o presupposto?`;
        }

        return { introduction, question };
    }

    try {
        const previousContext = previousNodes.length > 0
            ? `Lo studente ha già costruito questi concetti: ${previousNodes.map(n => n.label).join(', ')}.`
            : 'Questo è il primo concetto del macro-argomento.';

        const prompt = `Sei Blobb, la mascotte di Synapsia, una piattaforma di studio attivo. Il tuo tono è diretto, in seconda persona singolare, senza tecnicismi e senza infantilismi. Sei curioso, mai giudicante, e un po' spiritoso.

Siamo nel macro-argomento "${macroTopic}".
${previousContext}

Ora devi guidare lo studente a scoprire il concetto: "${node.label}" (${node.description || ''}).
Tipo di nodo: ${node.type} (${node.type === 'hub' ? 'concetto fondamentale' : node.type === 'intermediate' ? 'concetto intermedio' : 'dettaglio/esempio'}).

Genera UNA domanda aperta che porti lo studente a:
- Definire il concetto con le proprie parole
- Contestualizzarlo rispetto a quanto già costruito
- Se possibile, metterlo in relazione con i concetti precedenti

La domanda deve essere aperta, NON a risposta chiusa. Lo studente deve elaborare, non scegliere tra opzioni.

Rispondi con un JSON:
{
  "introduction": "breve frase di orientamento (es. 'Bene, andiamo avanti...')",
  "question": "la domanda aperta"
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI did not return valid JSON');
        return JSON.parse(jsonMatch[0]);
    } catch (err) {
        return {
            introduction: `Andiamo avanti in "${macroTopic}"...`,
            question: `Spiega in dettaglio il concetto di "${node.label}" in base a quanto ricordi e ai collegamenti logici.`
        };
    }
}

/**
 * Evaluate a student's answer.
 */
export async function evaluateAnswer(node, answer, macroTopic, attemptsCount = 1, previousAnswers = []) {
    if (useSimulator) {
        const wordsCount = answer.trim().split(/\s+/).length;
        let evaluation = "correct";
        let blobbState = "dance";
        let feedback = "";
        let revisedAnswer = `${node.label}: ${node.description || 'Concetto fondamentale di studio.'} (Aggiornato con la sintesi delle tue risposte).`;

        if (wordsCount < 3) {
            evaluation = "incorrect";
            blobbState = "skeptical";
            if (attemptsCount === 1) {
                feedback = `Mmm, la tua risposta per "${node.label}" mi sembra un po' troppo telegrafica. Ho bisogno che tu elabori di più! Ricordi cosa rappresenta in relazione a "${macroTopic}"? Fai un altro tentativo!`;
            } else if (attemptsCount === 2) {
                feedback = `Ancora un po' troppo corta. Più nello specifico, ricordati che stiamo parlando di ${node.label}. Cerca di dare una definizione minima di almeno una frase!`;
            } else {
                feedback = `Vedo che questo concetto è ostico. Ti consiglio di ripassare il capitolo dedicato nel materiale di origine. Per ora andiamo avanti, ho sbloccato il nodo con la definizione corretta così non ti blocchi!`;
                revisedAnswer = `${node.label}: ${node.description || 'Definizione completata dal sistema.'}`;
            }
        } else if (wordsCount < 8) {
            evaluation = "partial";
            blobbState = "skeptical";
            if (attemptsCount === 1) {
                feedback = `Ci sei quasi su "${node.label}", ma è un po' superficiale. Ricorda che questo concetto riguarda specificamente ${node.description || 'una parte essenziale del materiale'}. Riusciresti a completarlo spiegando meglio la sua applicazione o definizione?`;
                revisedAnswer = `${node.label}: ${node.description || 'Concetto analizzato nel materiale.'} (${answer})`;
            } else if (attemptsCount === 2) {
                feedback = `Sei a un passo dall'assimilarlo del tutto! Ti do un indizio: focalizzati su come si collega a "${macroTopic}" e prova a integrare quello che hai scritto prima.`;
                revisedAnswer = `${node.label}: ${node.description || 'Concetto parzialmente descritto.'} (${previousAnswers.join(' + ')} + ${answer})`;
            } else {
                feedback = `Ottimo tentativo! Per non fermare il tuo avanzamento, ho integrato i dettagli mancanti nella mappa: ${node.description || 'Definizione completa'}. Andiamo avanti!`;
                revisedAnswer = `${node.label}: ${node.description || 'Definizione integrata con successo.'}`;
            }
        } else {
            // Correct
            if (wordsCount > 20) {
                blobbState = "amazed";
                feedback = `Accidenti, che spiegazione accurata! Blobb è impressionato. Hai integrato benissimo i dettagli del concetto di "${node.label}". Ho aggiunto questo nodo alla nostra mappa in cantiere!`;
            } else {
                blobbState = "dance";
                feedback = `Ottimo lavoro! La tua definizione di "${node.label}" centra esattamente il punto. Il tassello si incastra perfettamente nella mappa!`;
            }
            revisedAnswer = `${node.label}: ${node.description || 'Dettagli strutturati nel percorso.'} — ${answer}`;
        }

        return {
            evaluation,
            blobbState,
            feedback,
            revisedAnswer,
            progressDelta: evaluation === 'correct' ? 15 : evaluation === 'partial' ? 8 : 0
        };
    }

    try {
        const previousContext = previousAnswers.length > 1
            ? `\nStorico dei tentativi precedenti falliti dello studente per questo nodo: ${JSON.stringify(previousAnswers.slice(0, -1))}`
            : '';

        const prompt = `Sei Blobb, la mascotte di Synapsia, una piattaforma di studio attivo. Il tuo tono è diretto, in seconda persona singolare, senza infantilismi e senza frasi fatte. Parli italiano.
Valuta la risposta dello studente al concetto "${node.label}" nel macro-argomento "${macroTopic}".
Questo è il tentativo numero ${attemptsCount} dello studente per questo concetto.${previousContext}

Descrizione attesa del concetto da verificare: ${node.description || node.label}

Risposta corrente dello studente da valutare: "${answer}"

REGOLE PER IL FEEDBACK IN BASE AL TENTATIVO E ALLA VALUTAZIONE:
- Se la risposta è CORRETTA (correct):
  - Blobb esulta e si complimenta velocemente (blobbState: dance o amazed).
- Se la risposta è PARZIALMENTE CORRETTA (partial):
  - Al tentativo 1: Blobb fa un apprezzamento sulla risposta ed evidenzia cosa manca in modo curioso per indirizzare lo studente a integrarla (blobbState: skeptical).
  - Al tentativo 2: Blobb fornisce un suggerimento o indizio molto concreto sui dettagli mancanti per aiutarlo a finire (blobbState: skeptical).
  - Al tentativo 3: Blobb fornisce direttamente i dettagli mancanti per permettere di completare il nodo e andare avanti senza bloccarsi (blobbState: dance).
- Se la risposta è ERRATA o del tutto insufficiente (incorrect):
  - Al tentativo 1: Blobb invia un incoraggiamento ed un accenno generale o indizio leggero per stimolare la memoria (blobbState: skeptical).
  - Al tentativo 2: Blobb fornisce un aiuto o indizio più specifico e mirato sull'argomento per stimolare la risposta corretta (blobbState: skeptical).
  - Al tentativo 3: Blobb consiglia all'utente di ripassare l'argomento, indicando il capitolo/paragrafo pertinente nel file originale (ad esempio: "Ti suggerisco di dare un'occhiata alla parte relativa a ${node.label} del materiale"), sbloccando il nodo d'ufficio per andare avanti così da non bloccare la sessione (blobbState: skeptical).

Rispondi ESCLUSIVAMENTE con un JSON valido in questo formato:
{
  "evaluation": "correct|partial|incorrect",
  "blobbState": "amazed|dance|idle|skeptical",
  "feedback": "il tuo feedback personalizzato in italiano",
  "revisedAnswer": "la risposta corretta e completa basata sul materiale da salvare nella mappa (non copiata dallo studente)",
  "progressDelta": 10
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI did not return valid JSON');
        return JSON.parse(jsonMatch[0]);
    } catch (err) {
        return {
            evaluation: "correct",
            blobbState: "dance",
            feedback: `Perfetto! Hai aggiunto "${node.label}" alla mappa concettuale.`,
            revisedAnswer: `${node.label}: ${node.description || 'Definizione completata dallo studente.'} (Sintesi: ${answer})`,
            progressDelta: 10
        };
    }
}
