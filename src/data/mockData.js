export const MOCK_PROJECTS = [
    {
        id: "mock_change_management",
        name: "Change Management",
        totalNodes: 17,
        completedNodes: 17,
        macroTopics: ["Modelli di Cambiamento", "Resistenze e Inerzia", "Strategie e Gestione", "Sistemi di Controllo (PMS)"]
    },
    {
        id: "mock_marketing",
        name: "Marketing",
        totalNodes: 17,
        completedNodes: 17,
        macroTopics: ["Business Model Canvas", "Customer Profile e Canali", "Customer-Driven Marketing", "Strategia del Brand"]
    },
    {
        id: "mock_tiga",
        name: "TIGA",
        totalNodes: 17,
        completedNodes: 16,
        macroTopics: ["Modelli e Sistemi", "BPR e Cambiamento", "Infrastrutture IT"]
    }
];

export const MOCK_COMPLETED_SUBJECTS = {
    "mock_change_management": {
        id: "mock_change_management",
        name: "Change Management",
        totalNodes: 17,
        completedNodes: [
            "change_mgmt_intro", "teleological_theory", "greiner_growth_model", 
            "greiner_burocracy_crisis", "kotter_8_steps", "lewin_force_field", 
            "resistance_to_change", "path_dependence", "bias_conferma", 
            "caso_nokia", "caso_uk_coal", "burke_litwin_model",
            "stakeholder_analysis", "communication_plan", "resistance_tactics",
            "simons_levers", "performance_indicators"
        ],
        conceptMap: {
            macroTopics: ["Modelli di Cambiamento", "Resistenze e Inerzia", "Strategie e Gestione", "Sistemi di Controllo (PMS)"],
            nodes: [
                { id: "change_mgmt_intro", label: "Change Management", macroTopic: "Modelli di Cambiamento", type: "hub", abstractionLevel: 5, description: "Lo studio strutturato della transizione organizzativa dal lato delle persone per allinearle all'ambiente esterno." },
                { id: "teleological_theory", label: "Teorie Teleologiche", macroTopic: "Modelli di Cambiamento", type: "intermediate", abstractionLevel: 4, description: "Modello in cui il cambiamento è pianificato e guidato dal vertice verso uno scopo o obiettivo prestabilito." },
                { id: "greiner_growth_model", label: "Modello di Greiner", macroTopic: "Modelli di Cambiamento", type: "hub", abstractionLevel: 5, description: "Modello evolutivo in cui ogni fase di crescita aziendale si conclude con una crisi specifica che richiede un nuovo assetto." },
                { id: "greiner_burocracy_crisis", label: "Crisi Burocratica", macroTopic: "Modelli di Cambiamento", type: "leaf", abstractionLevel: 2, description: "Stadio di crescita in cui l'eccesso di procedure formali rallenta l'innovazione, richiedendo collaborazione." },
                { id: "kotter_8_steps", label: "8 Fasi di Kotter", macroTopic: "Modelli di Cambiamento", type: "hub", abstractionLevel: 5, description: "Metodologia in 8 stadi per guidare il cambiamento strategico, dalla creazione dell'urgenza all'ancoraggio nella cultura." },
                { id: "lewin_force_field", label: "Teoria dei Campi di Lewin", macroTopic: "Resistenze e Inerzia", type: "intermediate", abstractionLevel: 3, description: "Modello in tre fasi (unfreeze, change, refreeze) che analizza le forze propulsive e le forze inibitrici del cambiamento." },
                { id: "resistance_to_change", label: "Resistenze Organizzative", macroTopic: "Resistenze e Inerzia", type: "intermediate", abstractionLevel: 3, description: "Ostacoli al cambiamento dovuti alla percezione di minaccia al proprio status, potere o riduzione del budget." },
                { id: "path_dependence", label: "Path Dependence", macroTopic: "Resistenze e Inerzia", type: "intermediate", abstractionLevel: 3, description: "Tendenza di un'organizzazione a rimanere vincolata a percorsi storici e decisioni passate (lock-in)." },
                { id: "bias_conferma", label: "Bias di Conferma", macroTopic: "Resistenze e Inerzia", type: "leaf", abstractionLevel: 2, description: "Bias cognitivo per cui i manager selezionano solo dati favorevoli allo status quo, ignorando i segnali di crisi." },
                { id: "caso_nokia", label: "Caso Nokia", macroTopic: "Modelli di Cambiamento", type: "leaf", abstractionLevel: 1, description: "Caso di studio reale in cui la sindrome del successo ha portato alla negazione del declino e al fallimento." },
                { id: "caso_uk_coal", label: "Caso UK Coal", macroTopic: "Modelli di Cambiamento", type: "leaf", abstractionLevel: 1, description: "Esempio reale di Re-creation radicale, in cui l'azienda è passata dal carbone al settore immobiliare." },
                { id: "burke_litwin_model", label: "Modello Burke-Litwin", macroTopic: "Resistenze e Inerzia", type: "intermediate", abstractionLevel: 4, description: "Framework che separa le variabili trasformativa (mission, leadership, cultura) da quelle transazionali (clima, pratiche)." },
                { id: "stakeholder_analysis", label: "Analisi Stakeholder", macroTopic: "Strategie e Gestione", type: "intermediate", abstractionLevel: 3, description: "Mappatura degli interessi, del potere di influenza e dell'atteggiamento dei diversi stakeholder verso il cambiamento." },
                { id: "communication_plan", label: "Piano Comunicazione", macroTopic: "Strategie e Gestione", type: "leaf", abstractionLevel: 2, description: "Pianificazione dei flussi informativi per ridurre le incertezze, spiegare i benefici e contrastare le resistenze." },
                { id: "resistance_tactics", label: "Tattiche di Gestione", macroTopic: "Strategie e Gestione", type: "intermediate", abstractionLevel: 4, description: "Metodi per superare l'ostilità: coinvoglimento, supporto educativo, negoziazione, cooptazione o coercizione." },
                { id: "simons_levers", label: "Leve di Controllo Simons", macroTopic: "Sistemi di Controllo (PMS)", type: "hub", abstractionLevel: 5, description: "Framework con quattro leve (sistemi diagnostici, interattivi, valori e limiti) per implementare e guidare la strategia." },
                { id: "performance_indicators", label: "Sistemi KPI", macroTopic: "Sistemi di Controllo (PMS)", type: "leaf", abstractionLevel: 2, description: "Indicatori quantitativi e qualitativi bilanciati utilizzati per monitorare le transizioni e verificare l'efficacia dei processi." }
            ],
            edges: [
                { from: "change_mgmt_intro", to: "teleological_theory", type: "intra", description: "L'approccio teleologico pianifica la transizione strategica." },
                { from: "change_mgmt_intro", to: "greiner_growth_model", type: "intra", description: "La crescita dimensionale innesca crisi evolutive." },
                { from: "greiner_growth_model", to: "greiner_burocracy_crisis", type: "intra", description: "La crisi di burocrazia precede l'ultima fase collaborativa." },
                { from: "change_mgmt_intro", to: "kotter_8_steps", type: "intra", description: "Kotter propone un piano in 8 fasi per gestire la transizione organizzativa." },
                { from: "kotter_8_steps", to: "lewin_force_field", type: "inter", description: "Il piano di transizione deve scongelare (unfreeze) le vecchie abitudini." },
                { from: "lewin_force_field", to: "resistance_to_change", type: "intra", description: "Le forze inibitrici generano resistenze individuali." },
                { from: "resistance_to_change", to: "path_dependence", type: "intra", description: "Le resistenze consolidano l'inerzia storica dell'organizzazione." },
                { from: "path_dependence", to: "bias_conferma", type: "intra", description: "La dipendenza dal percorso rafforza il bias cognitivo di conferma." },
                { from: "resistance_to_change", to: "caso_nokia", type: "intra", description: "La negazione del cambiamento ha portato al crollo di Nokia." },
                { from: "change_mgmt_intro", to: "caso_uk_coal", type: "intra", description: "UK Coal rappresenta un caso drastico di ricreazione strategica." },
                { from: "resistance_to_change", to: "burke_litwin_model", type: "intra", description: "Burke-Litwin separa le resistenze culturali da quelle transazionali." },
                { from: "lewin_force_field", to: "caso_nokia", type: "intra", description: "L'incapacità di scongelare le abitudini spiega il fallimento Nokia." },
                { from: "kotter_8_steps", to: "communication_plan", type: "intra", description: "La comunicazione della visione fa parte delle fasi chiave di Kotter." },
                { from: "resistance_to_change", to: "resistance_tactics", type: "intra", description: "Le resistenze richiedono tattiche di gestione mirate per essere ridotte." },
                { from: "stakeholder_analysis", to: "resistance_tactics", type: "intra", description: "L'analisi degli stakeholder orienta la scelta delle tattiche di coinvolgimento." },
                { from: "change_mgmt_intro", to: "simons_levers", type: "intra", description: "Le leve di Simons collegano il controllo di gestione e il cambiamento strategico." },
                { from: "simons_levers", to: "performance_indicators", type: "intra", description: "Il controllo diagnostico e interattivo si appoggia su indicatori di performance bilanciati." }
            ]
        },
        answers: {
            change_mgmt_intro: { revised: "Gestione pianificata della transizione organizzativa, allineando risorse umane, processi e tecnologie all'ambiente esterno." },
            teleological_theory: { revised: "Modello strategico in cui il cambiamento è intenzionale, orientato ad un obiettivo chiaro e pianificato dal vertice." },
            greiner_growth_model: { revised: "Modello evolutivo a 5 fasi in cui la crescita genera inevitabilmente crisi interne superabili solo con nuove strutture." },
            greiner_burocracy_crisis: { revised: "Punto di rottura generato dall'eccesso di procedure formali, risolvibile favorendo team collaborativi." },
            kotter_8_steps: { revised: "Processo strutturato per implementare visioni di cambiamento, partendo dal senso d'urgenza fino al consolidamento culturale." },
            lewin_force_field: { revised: "Analisi delle forze propulsive (cambiamento) e inibitrici (resistenza) attraverso tre stadi: unfreeze, change, refreeze." },
            resistance_to_change: { revised: "Reazione protettiva del personale dovuta alla minaccia allo status, al potere e alla ripartizione del budget." },
            path_dependence: { revised: "Inerzia strutturale in cui le decisioni passate creano percorsi rigidi e barriere cognitive difficili da scardinare." },
            bias_conferma: { revised: "Tendenza del management a selezionare solo dati favorevoli allo status quo, negando i segnali esterni di declino." },
            caso_nokia: { revised: "Esempio storico di sindrome del successo in cui la leadership ha negato l'ascesa degli smartphone fino al fallimento." },
            caso_uk_coal: { revised: "Caso estremo di ricreazione strategica (re-creation) in cui una miniera storica si è convertita al settore immobiliare." },
            burke_litwin_model: { revised: "Framework diagnostico che separa le leve trasformative (strategia, cultura) da quelle transazionali (clima di lavoro)." },
            stakeholder_analysis: { revised: "Mappatura sistematica degli attori chiave, pesando la loro influenza e resistenza al cambiamento strategico." },
            communication_plan: { revised: "Pianificazione strategica dell'informazione aziendale per scongiurare disallineamenti ed ansie." },
            resistance_tactics: { revised: "Misure relazionali (coinvolgimento, istruzione, cooptazione, negoziazione) volte a smussare le resistenze." },
            simons_levers: { revised: "Le quattro leve (Beliefs, Boundaries, Diagnostic, Interactive) per allineare l'organizzazione." },
            performance_indicators: { revised: "Metriche e KPI multidimensionali per misurare la performance delle singole Business Unit nel tempo." }
        }
    },
    "mock_marketing": {
        id: "mock_marketing",
        name: "Marketing",
        totalNodes: 17,
        completedNodes: [
            "business_model_canvas", "value_proposition_canvas", "value_proposition", 
            "customer_segments", "channels_distribution", "customer_relationships", 
            "revenue_streams", "long_tail", "caso_lego_factory", 
            "caso_netflix_blockbuster", "value_prop_pains", "gillette_ip_lockin",
            "market_segmentation", "targeting_positioning", "b2b_b2c_marketing",
            "brand_equity", "branding_decisions"
        ],
        conceptMap: {
            macroTopics: ["Business Model Canvas", "Customer Profile e Canali", "Customer-Driven Marketing", "Strategia del Brand"],
            nodes: [
                { id: "business_model_canvas", label: "Business Model Canvas", macroTopic: "Business Model Canvas", type: "hub", abstractionLevel: 5, description: "Framework strategico basato su 9 blocchi per mappare la logica con cui un'impresa crea, distribuisce e cattura valore." },
                { id: "value_proposition_canvas", label: "Value Proposition Canvas", macroTopic: "Business Model Canvas", type: "hub", abstractionLevel: 5, description: "Modello analitico che allinea il profilo del cliente (jobs, pains, gains) con la mappa dell'offerta di valore dell'azienda." },
                { id: "value_proposition", label: "Value Proposition", macroTopic: "Business Model Canvas", type: "intermediate", abstractionLevel: 3, description: "L'offerta di valore ideata per risolvere specifici problemi del cliente o produrre benefici apprezzati dal target." },
                { id: "customer_segments", label: "Customer Segments", macroTopic: "Customer Profile e Canali", type: "intermediate", abstractionLevel: 3, description: "La clusterizzazione della clientela in mercati di massa, nicchie, diversificati o mercati interdipendenti (multi-sided)." },
                { id: "channels_distribution", label: "Channels", macroTopic: "Customer Profile e Canali", type: "intermediate", abstractionLevel: 3, description: "I canali diretti, indiretti, propri o di partner attraverso cui l'offerta viene presentata e consegnata ai clienti." },
                { id: "customer_relationships", label: "Customer Relationships", macroTopic: "Customer Profile e Canali", type: "intermediate", abstractionLevel: 3, description: "Tipologie di relazione con il cliente finalizzate ad acquisire e trattenere contatti (assistenza, community, co-creation)." },
                { id: "revenue_streams", label: "Revenue Streams", macroTopic: "Business Model Canvas", type: "intermediate", abstractionLevel: 3, description: "I flussi finanziari generati dalle vendite, dagli abbonamenti, da royalty o commissioni di intermediazione." },
                { id: "long_tail", label: "Long Tail (Coda Lunga)", macroTopic: "Business Model Canvas", type: "hub", abstractionLevel: 4, description: "Strategia di mercato focalizzata sulla vendita di piccoli volumi di molti prodotti di nicchia personalizzati." },
                { id: "caso_lego_factory", label: "Caso Lego Factory", macroTopic: "Customer Profile e Canali", type: "leaf", abstractionLevel: 1, description: "Esempio reale di modello a coda lunga in cui i clienti co-creano e vendono i propri kit di mattoncini personalizzati." },
                { id: "caso_netflix_blockbuster", label: "Netflix vs Blockbuster", macroTopic: "Business Model Canvas", type: "leaf", abstractionLevel: 1, description: "Esempio di distruzione di un modello fisico (Blockbuster) a causa della mancata transizione verso lo streaming digitale." },
                { id: "value_prop_pains", label: "Cliente Pains/Gains", macroTopic: "Customer Profile e Canali", type: "leaf", abstractionLevel: 2, description: "Analisi empirica dei problemi, dei rischi (pains) e delle aspettative di guadagno (gains) del consumatore target." },
                { id: "gillette_ip_lockin", label: "Gillette Lock-in", macroTopic: "Business Model Canvas", type: "leaf", abstractionLevel: 1, description: "Modello Razor & Blade basato sulla fidelizzazione forzata tramite ricambi brevettati ad alto margine." },
                { id: "market_segmentation", label: "Segmentazione", macroTopic: "Customer-Driven Marketing", type: "intermediate", abstractionLevel: 3, description: "Divisione del mercato complessivo in cluster di acquirenti omogenei sulla base di variabili demografiche, psicografiche o comportamentali." },
                { id: "targeting_positioning", label: "Targeting & Posizionamento", macroTopic: "Customer-Driven Marketing", type: "hub", abstractionLevel: 5, description: "Scelta dei segmenti più interessanti e posizionamento distintivo del marchio nella mente dei clienti rispetto ai concorrenti." },
                { id: "b2b_b2c_marketing", label: "Marketing B2B vs B2C", macroTopic: "Customer-Driven Marketing", type: "intermediate", abstractionLevel: 3, description: "Analisi delle differenze tra transazioni con il consumatore finale (B2C) e con altre imprese (B2B), basate su filiere più lunghe." },
                { id: "brand_equity", label: "Brand Equity", macroTopic: "Strategia del Brand", type: "hub", abstractionLevel: 5, description: "Il valore intangibile del marchio basato sulla percezione di qualità, notorietà e fedeltà da parte del consumatore." },
                { id: "branding_decisions", label: "Decisioni sul Marchio", macroTopic: "Strategia del Brand", type: "leaf", abstractionLevel: 2, description: "Scelte relative all'architettura di marca, co-branding, estensione di linea o di categoria per presidiare i mercati." }
            ],
            edges: [
                { from: "business_model_canvas", to: "value_proposition_canvas", type: "intra", description: "Il canvas di valore approfondisce il core del modello di business." },
                { from: "value_proposition_canvas", to: "value_proposition", type: "intra", description: "L'analisi dei bisogni definisce la proposta di valore." },
                { from: "business_model_canvas", to: "customer_segments", type: "intra", description: "I segmenti di clientela sono i destinatari del valore creato." },
                { from: "customer_segments", to: "channels_distribution", type: "intra", description: "I canali trasportano la value proposition ai segmenti definiti." },
                { from: "customer_segments", to: "customer_relationships", type: "intra", description: "La relazione determina l'acquisizione e fidelizzazione del segmento." },
                { from: "business_model_canvas", to: "revenue_streams", type: "intra", description: "I segmenti alimentano i flussi di ricavo pagando per il valore." },
                { from: "business_model_canvas", to: "long_tail", type: "intra", description: "La coda lunga è un tipico pattern strutturale del business canvas." },
                { from: "long_tail", to: "caso_lego_factory", type: "intra", description: "Lego Factory è l'esempio principe di monetizzazione della coda lunga." },
                { from: "customer_relationships", to: "caso_lego_factory", type: "intra", description: "La relazione di co-creation permette l'attivazione della coda lunga." },
                { from: "business_model_canvas", to: "caso_netflix_blockbuster", type: "intra", description: "Netflix dimostra l'evoluzione dei flussi di ricavo in streaming." },
                { from: "value_proposition_canvas", to: "value_prop_pains", type: "intra", description: "Il profilo descrive compiti, mal di pancia e sogni del cliente." },
                { from: "business_model_canvas", to: "gillette_ip_lockin", type: "intra", description: "Gillette sfrutta i brevetti per blindare la relazione ed i ricavi." },
                { from: "customer_segments", to: "market_segmentation", type: "intra", description: "La segmentazione definisce i cluster omogenei di clientela all'interno del mercato." },
                { from: "market_segmentation", to: "targeting_positioning", type: "intra", description: "Dopo aver segmentato, si sceglie il target strategico e si definisce il posizionamento del marchio." },
                { from: "targeting_positioning", to: "b2b_b2c_marketing", type: "intra", description: "Il posizionamento differisce a seconda che si operi in mercati consumer (B2C) o industriali (B2B)." },
                { from: "business_model_canvas", to: "brand_equity", type: "intra", description: "Il brand è una risorsa chiave intangibile fondamentale per sostenere il modello strategico." },
                { from: "brand_equity", to: "branding_decisions", type: "intra", description: "La forza del marchio guida le decisioni strategiche di estensione di linea e presidio." }
            ]
        },
        answers: {
            business_model_canvas: { revised: "Framework di Osterwalder per visualizzare e testare in modo sistematico il funzionamento di un'azienda." },
            value_proposition_canvas: { revised: "Strumento per studiare l'allineamento tra bisogni del cliente (osservati) e proposta di valore (progettata)." },
            value_proposition: { revised: "I benefici specifici che convincono il cliente a scegliere l'azienda, risolvendo i suoi problemi." },
            customer_segments: { revised: "I cluster di clientela target, distinti per bisogni e logiche di acquisto, a cui è destinato il valore." },
            channels_distribution: { revised: "I punti di contatto attraverso cui l'azienda comunica e recapita l'offerta al consumatore." },
            customer_relationships: { revised: "Le modalità di gestione del contatto per acquisire, trattenere ed incrementare il fatturato sul cliente." },
            revenue_streams: { revised: "Il modo in cui l'azienda cattura parte del valore distribuito trasformandolo in ricavi." },
            long_tail: { revised: "Modello che punta a ricavi consistenti aggregando piccole vendite di molti prodotti di nicchia." },
            caso_lego_factory: { revised: "Modello in cui la Lego mette a disposizione software CAD affinché i clienti co-creino kit personalizzati." },
            caso_netflix_blockbuster: { revised: "Caso storico di distruzione creativa: l'incapacità di adattare i canali fisici al modello streaming digitale." },
            value_prop_pains: { revised: "I disagi, i costi e i rischi (pains) riscontrati dal cliente durante lo svolgimento dei suoi compiti." },
            gillette_ip_lockin: { revised: "Fidelizzazione vincolante basata sul brevetto esclusivo delle lamette di ricambio per rasoio." },
            market_segmentation: { revised: "Clusterizzazione geografica, socio-demografica, psicografica ed empirica della domanda di mercato." },
            targeting_positioning: { revised: "Selezione delle nicchie a maggior valore e definizione del posizionamento competitivo del marchio." },
            b2b_b2c_marketing: { revised: "Differenza strategica tra vendite ad utenti finali rispetto ad acquisti aziendali più formali e complessi." },
            brand_equity: { revised: "Valore intangibile monetario ed emotivo associato al nome e alla reputazione del marchio." },
            branding_decisions: { revised: "Definizione dell'architettura di marca e di estensione per capitalizzare sul valore reputazionale." }
        }
    },
    "mock_tiga": {
        id: "mock_tiga",
        name: "TIGA",
        totalNodes: 17,
        completedNodes: [
            "tiga_intro", "automazione_coordinamento", "processi_intra_inter", 
            "impatto_trasversale", "resistenza_cambiamento", "change_agents", 
            "end_user_stakeholder", "best_practices", "clean_slate", 
            "technology_enabled", "functional_fit", "gap_analysis", 
            "integrazione_informativa", "architettura_rete", "client_server", 
            "application_db_server"
        ],
        conceptMap: {
            macroTopics: ["Modelli e Sistemi", "BPR e Cambiamento", "Infrastrutture IT"],
            nodes: [
                { id: "tiga_intro", label: "TIGA", macroTopic: "Modelli e Sistemi", type: "hub", abstractionLevel: 5, description: "Tecnologie Informatiche per la Gestione Aziendale. Studio integrato dell'interazione tra sistemi IT e dinamiche organizzative." },
                { id: "automazione_coordinamento", label: "Automazione vs Coordinamento", macroTopic: "Modelli e Sistemi", type: "intermediate", abstractionLevel: 4, description: "Sistemi di automazione (efficienza operativa locale) vs sistemi di coordinamento (integrazione dei processi trasversali)." },
                { id: "processi_intra_inter", label: "Processi Intra e Inter-org", macroTopic: "Modelli e Sistemi", type: "intermediate", abstractionLevel: 3, description: "Processi intra-organizzativi (interni come l'ERP) e inter-aziendali (interscambio lungo la filiera)." },
                { id: "impatto_trasversale", label: "Impatto Trasversale", macroTopic: "Modelli e Sistemi", type: "leaf", abstractionLevel: 2, description: "Influenza pervasiva del software sull'intero assetto socio-tecnico (persone, processi, ruoli e tecnologie)." },
                { id: "resistenza_cambiamento", label: "Resistenza al Cambiamento", macroTopic: "BPR e Cambiamento", type: "intermediate", abstractionLevel: 3, description: "Inerzia organizzativa generata da cambiamenti nel modo di lavorare, ridefinizione dei compiti e timore di perdere status o potere." },
                { id: "change_agents", label: "Agenti del Cambiamento", macroTopic: "BPR e Cambiamento", type: "leaf", abstractionLevel: 2, description: "Consulenti o figure guida interne incaricate di favorire l'adozione della nuova tecnologia e gestire le resistenze procedurali." },
                { id: "end_user_stakeholder", label: "Utenti e Stakeholder", macroTopic: "BPR e Cambiamento", type: "intermediate", abstractionLevel: 3, description: "End-user (utilizzatori finali operativi) vs Stakeholder (manager e direttori funzionali che traggono i benefici diretti)." },
                { id: "best_practices", label: "Best Practices", macroTopic: "BPR e Cambiamento", type: "leaf", abstractionLevel: 1, description: "Flussi procedurali ottimali pre-configurati all'interno dei pacchetti commerciali standard basati sull'esperienza di leader di settore." },
                { id: "clean_slate", label: "Clean Slate", macroTopic: "BPR e Cambiamento", type: "intermediate", abstractionLevel: 4, description: "Riprogettazione dei processi (BPR) a lavagna bianca, in modo totalmente svincolato e indipendente dalle caratteristiche del software." },
                { id: "technology_enabled", label: "Technology Enabled", macroTopic: "BPR e Cambiamento", type: "intermediate", abstractionLevel: 4, description: "BPR guidato dal software, in cui l'azienda decide di adottare una tecnologia standard e vi adatta i propri processi interni." },
                { id: "functional_fit", label: "Functional Fit", macroTopic: "BPR e Cambiamento", type: "leaf", abstractionLevel: 2, description: "Grado di aderenza funzionale tra le logiche operative del software commerciale standard e i processi desiderati dall'azienda." },
                { id: "gap_analysis", label: "Gap Analysis", macroTopic: "BPR e Cambiamento", type: "leaf", abstractionLevel: 1, description: "Analisi per quantificare il divario tra i requisiti to-be dell'impresa e le funzionalità offerte dal software, decidendo se customizzare o rinunciare." },
                { id: "integrazione_informativa", label: "Integrazione Informativa", macroTopic: "Modelli e Sistemi", type: "hub", abstractionLevel: 5, description: "Superamento dei silos aziendali (isole di automazione) per sincronizzare i dati e annullare la latenza informativa." },
                { id: "architettura_rete", label: "Architettura di Rete", macroTopic: "Infrastrutture IT", type: "intermediate", abstractionLevel: 3, description: "Dispositivi fisici come LAN, WAN, router, switch e server dedicati a veicolare e condividere le risorse informative aziendali." },
                { id: "client_server", label: "Client-Server", macroTopic: "Infrastrutture IT", type: "intermediate", abstractionLevel: 3, description: "Modello architetturale basato su multitasking e gestione degli accessi in tempo reale degli utenti concorrenti (concurrent users)." },
                { id: "application_db_server", label: "Server Applicativi e DB", macroTopic: "Infrastrutture IT", type: "hub", abstractionLevel: 5, description: "Separazione delle macchine deputate a far girare i software (application server) da quelle che ospitano il DBMS relazionale (database server)." },
                { id: "mrp_system", label: "Sistemi MRP", macroTopic: "Modelli e Sistemi", type: "leaf", abstractionLevel: 1, description: "Material Requirements Planning. Algoritmo di calcolo del fabbisogno netto dei materiali basato su distinte base, scorte e ordini." }
            ],
            edges: [
                { from: "tiga_intro", to: "automazione_coordinamento", type: "intra", description: "TIGA si sposta dal controllo operativo locale al coordinamento." },
                { from: "automazione_coordinamento", to: "processi_intra_inter", type: "intra", description: "Il coordinamento avviene sia internamente che esternamente all'azienda." },
                { from: "automazione_coordinamento", to: "impatto_trasversale", type: "intra", description: "I sistemi di coordinamento impattano trasversalmente tutta l'azienda." },
                { from: "impatto_trasversale", to: "resistenza_cambiamento", type: "intra", description: "L'impatto trasversale altera le routine lavorative provocando resistenza." },
                { from: "resistenza_cambiamento", to: "change_agents", type: "intra", description: "Gli agenti del cambiamento mitigano le resistenze nel sistema socio-tecnico." },
                { from: "resistenza_cambiamento", to: "end_user_stakeholder", type: "intra", description: "Gli utenti operativi oppongono maggiore resistenza rispetto agli stakeholder." },
                { from: "end_user_stakeholder", to: "best_practices", type: "intra", description: "Le best practices forzano gli end-user ad allinearsi a standard condivisi." },
                { from: "best_practices", to: "clean_slate", type: "inter", description: "Il clean slate progetta i processi to-be prima di valutare le best practices." },
                { from: "best_practices", to: "technology_enabled", type: "inter", description: "Il technology-enabled impone le best practices incorporate nel pacchetto." },
                { from: "clean_slate", to: "functional_fit", type: "intra", description: "L'approccio clean slate mira a massimizzare il fit funzionale del software." },
                { from: "technology_enabled", to: "functional_fit", type: "intra", description: "L'approccio technology-enabled si adatta al software riducendo i costi di fit." },
                { from: "functional_fit", to: "gap_analysis", type: "intra", description: "La gap analysis quantifica lo scarto rispetto alle caratteristiche standard del software." },
                { from: "tiga_intro", to: "integrazione_informativa", type: "intra", description: "L'integrazione informativa elimina i silos organizzativi." },
                { from: "integrazione_informativa", to: "architettura_rete", type: "inter", description: "La rete fisica supporta l'integrazione logica dei dati aziendali." },
                { from: "architettura_rete", to: "client_server", type: "intra", description: "L'infrastruttura di rete abilita la comunicazione client-server multitasking." },
                { from: "client_server", to: "application_db_server", type: "intra", description: "L'architettura suddivide i carichi tra logica applicativa e database relazionale." },
                { from: "application_db_server", to: "mrp_system", type: "inter", description: "L'algoritmo MRP interroga il database server per calcolare i fabbisogni." }
            ]
        },
        answers: {
            tiga_intro: { revised: "Sintesi: Tecnologie Informatiche per la Gestione Aziendale. Si focalizzano sui flussi informativi." },
            automazione_coordinamento: { revised: "Sintesi: Sistemi di automazione (efficienza locale) vs sistemi di coordinamento (integrazione trasversale dei processi)." },
            processi_intra_inter: { revised: "Sintesi: Processi intra-organizzativi (interni come l'ERP) e inter-aziendali (coordinamento logistico e di filiera)." },
            impatto_trasversale: { revised: "Sintesi: Impatto trasversale su persone, processi e tecnologie all'interno dell'organizzazione socio-tecnica." },
            resistenza_cambiamento: { revised: "Sintesi: Inerzia e barriere psicologiche sollevate dal personale a causa di modifiche dei compiti." },
            change_agents: { revised: "Sintesi: Figure professionali esterne (agenti del cambiamento) deputate a gestire la transizione culturale." },
            end_user_stakeholder: { revised: "Sintesi: Utilizzatori finali operativi (end-user) e manager di processo (stakeholder) con interessi diversi." },
            best_practices: { revised: "Sintesi: Procedure eccellenti di riferimento già cablate all'interno delle soluzioni software standard." },
            clean_slate: { revised: "Sintesi: Riprogettazione radicale dei processi su foglio bianco, totalmente svincolata dal software." },
            technology_enabled: { revised: "Sintesi: Scelta a priori del software standard con conseguente adeguamento dei flussi interni dell'azienda." },
            functional_fit: { revised: "Sintesi: Livello di congruenza tra i requisiti desiderati to-be e le funzioni software offerte." },
            gap_analysis: { revised: "Sintesi: Analisi quantitativa dei divari per definire configurazioni, customizzazioni o deroghe." },
            integrazione_informativa: { revised: "Sintesi: Connessione dei silos informativi (isole di automazione) per condividere i dati in tempo reale." },
            architettura_rete: { revised: "Sintesi: Rete fisica LAN/WAN comprendente router, switch e server per la condivisione delle risorse." },
            client_server: { revised: "Sintesi: Schema architetturale composto da client richiedenti e server multitasking per utenti concorrenti." },
            application_db_server: { revised: "Sintesi: Separazione dei compiti tra application server (software) e database server (DBMS relazionale)." }
        },
        activeQuestion: {
            completed: false,
            type: "node",
            nodeId: "mrp_system",
            nodeLabel: "Sistemi MRP",
            nodeType: "leaf",
            macroTopic: "Modelli e Sistemi",
            introduction: "Ci siamo quasi! Manca solo l'ultimo tassello per unificare il cervello di TIGA. Parliamo dell'area di gestione della produzione...",
            question: "Descrivi il funzionamento e lo scopo principale di un sistema MRP (Material Requirements Planning) all'interno di un'azienda manufatturiera, menzionando i dati di input necessari.",
            attempts: 0,
            previousAnswers: [],
            progress: 94,
            currentIndex: 16,
            totalNodes: 17
        }
    }
};
