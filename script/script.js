// Sélectionne les éléments du DOM nécessaires pour le chatbot
const chatBody = document.querySelector(".chatbot-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");

// Configuration de l'API
const API_KEY = "AIzaSyDJl0YG4YQmdYd3ZOj749jYgX_nCDn8tKQ"; // Remplacez par votre clé API
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Fonction pour créer un élément de message avec des classes dynamiques et le retourner
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Liste des termes de neurosciences
const neuroscienceTerms = [
    "neurone",
    "synapse",
    "neurotransmetteur",
    "cortex",
    "hippocampe",
    "neuroplasticité",
    "système nerveux",
    "glie",
    "axone",
    "dendrite",
];

// Liste des maladies des nerfs
const nerveDiseases = [
    "sclérose en plaques",
    "maladie de Parkinson",
    "épilepsie",
    "neuropathie",
    "myasthénie",
    "sclérose latérale amyotrophique",
    "maladie d'Alzheimer",
    "avc",
    "traumatisme crânien",
];

// Liste des salutations
const greetings = ["bonjour", "salut", "hello", "hi", "bonsoir"];

// Fonction pour vérifier si le texte contient des termes spécifiques
const containsTerms = (text, terms) => {
    return terms.some((term) => text.toLowerCase().includes(term));
};

// Fonction pour obtenir la salutation appropriée en fonction de l'heure
const getTimeBasedGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Bonjour";
    if (currentHour < 18) return "Bon après-midi";
    return "Bonsoir";
};

// Fonction pour formater le texte généré
const formatGeneratedText = (text) => {
    // Exemple de formatage : ajouter des sauts de ligne après chaque phrase
    return text.replace(/([.?!])\s*(?=[A-Z])/g, "$1\n\n");
};

// Fonction pour remplacer les étoiles par des chiffres séquentiels
const replaceStarsWithNumbers = (text) => {
    let counter = 1;
    return text.replace(/\*/g, () => counter++);
};

// Fonction pour générer la réponse du bot en utilisant l'API
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    // Vérifie si le message de l'utilisateur contient une salutation
    if (containsTerms(userData.message, greetings)) {
        setTimeout(() => {
            const greeting = getTimeBasedGreeting();
            messageElement.innerText = `${greeting} ! Comment puis-je vous aider aujourd'hui ?`;
            incomingMessageDiv.classList.remove("thinking");
            chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        }, 1000); // Délai de 1 seconde avant de répondre
        return;
    }

    // Options de la requête API
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: userData.message }] }],
        }),
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        // Extraire et afficher le texte de la réponse du bot
        let apiResponseText = data.candidates[0].content.parts[0].text
            .replace(/\*\*(.*?)\*\*/g, "$1") // Supprime les éventuels caractères gras
            .trim();

        // Remplacer les étoiles par des chiffres séquentiels
        apiResponseText = replaceStarsWithNumbers(apiResponseText);

        // Limiter la longueur du texte généré
        const maxLength = 1000; // Augmenter la limite de caractères
        if (apiResponseText.length > maxLength) {
            apiResponseText = apiResponseText.substring(0, maxLength) + "...";
        }

        // Formater le texte généré
        apiResponseText = formatGeneratedText(apiResponseText);

        // Vérifie si la réponse contient des termes de neurosciences ou des maladies des nerfs
        if (
            !containsTerms(apiResponseText, neuroscienceTerms) &&
            !containsTerms(apiResponseText, nerveDiseases)
        ) {
            apiResponseText =
                "Je suis désolé, je ne peux répondre qu'aux questions liées aux neurosciences et aux maladies des nerfs.";
        }

        messageElement.innerText = apiResponseText;
    } catch (error) {
        console.log(error);
        messageElement.innerText =
            "Une erreur s'est produite. Veuillez réessayer plus tard.";
    } finally {
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }
};

// Objet pour stocker les données de l'utilisateur
const userData = { message: null };

// Fonction pour gérer l'envoi des messages de l'utilisateur
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";

    if (!userData.message) return;

    // Créer et afficher le message de l'utilisateur
    const outgoingMessageDiv = createMessageElement(
        `<div class="message-text"></div>`,
        "user-message"
    );
    outgoingMessageDiv.querySelector(".message-text").textContent =
        userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    // Simuler la réponse du bot avec un indicateur de réflexion après un délai
    setTimeout(() => {
        const incomingMessageDiv = createMessageElement(
            `<span class="material-symbols-outlined">smart_toy</span>
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>`,
            "bot-message",
            "thinking"
        );
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        generateBotResponse(incomingMessageDiv);
    }, 600);
};

// Gérer l'appui sur la touche Entrée pour envoyer des messages
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && messageInput.value.trim()) {
        handleOutgoingMessage(e);
    }
});

// Gérer le clic sur le bouton d'envoi pour envoyer des messages
sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
