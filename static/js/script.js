// ===============================
// AUDIOFLOW LITE
// ===============================

// Default text
let originalText = "Artificial intelligence is a technology that enables computers to perform tasks that normally require human intelligence.";

let currentText = originalText;
let currentMode = "verbatim";

const modeTitle = document.getElementById("mode-title");
const readingText = document.getElementById("reading-text");

let documentSections = [];
let currentSectionIndex = 0;


// ===============================
// READING MODE
// ===============================

function getModeText(text, mode) {
    if (mode === "verbatim") {
        return text;
    }

    return text;
}


async function showText(mode) {
    currentMode = mode;

    window.speechSynthesis.cancel();

    await displaySection();
}


// ===============================
// GROQ AI TRANSFORMATION
// ===============================

async function transformWithAI(text, mode) {
    const response = await fetch("/api/transform", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            text: text,
            mode: mode
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "AI transformation failed.");
    }

    return data.result;
}


// ===============================
// UPLOAD DOCUMENT
// ===============================

function uploadDocument() {
    const fileInput = document.getElementById("document-upload");
    const status = document.getElementById("upload-status");

    const file = fileInput.files[0];

    if (!file) {
        status.textContent = "Please select a text file first.";
        return;
    }

    if (!file.name.toLowerCase().endsWith(".txt")) {
        status.textContent = "Please upload a .txt file.";
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        originalText = event.target.result;

        currentMode = "verbatim";
        currentText = originalText;

        prepareSections();

        status.textContent = "Document uploaded successfully!";
    };

    reader.onerror = function() {
        status.textContent = "Unable to read the file.";
    };

    reader.readAsText(file);
}


// ===============================
// AUDIO FUNCTIONS
// ===============================

function speakText() {
    stopText();

    const speech = new SpeechSynthesisUtterance(currentText);

    speech.lang = "en-IN";

    window.speechSynthesis.speak(speech);
}


function pauseText() {
    window.speechSynthesis.pause();
}


function resumeText() {
    window.speechSynthesis.resume();
}


function stopText() {
    window.speechSynthesis.cancel();
}


// ===============================
// EXPLAIN WORD
// ===============================

function explainWord() {
    const word = document.getElementById("word-input")
        .value.trim().toLowerCase();

    const output = document.getElementById("word-explanation");

    const explanations = {
        "artificial": "Something made by humans, not naturally occurring.",

        "intelligence": "The ability to learn, understand and solve problems.",

        "technology": "Tools and methods created to solve problems.",

        "computer": "An electronic device that processes information.",

        "learning": "The process of gaining knowledge or skills.",

        "healthcare": "Services that help people stay healthy or get medical treatment.",

        "transportation": "The movement of people or goods from one place to another.",

        "education": "The process of learning and gaining knowledge.",

        "machine": "A device that uses energy to perform a task.",

        "performance": "How well someone or something does a task.",

        "programmed": "Given instructions to make a computer perform a task.",

        "data": "Information that can be stored and used by a computer.",

        "decision": "A choice made after thinking about different options."
    };

    if (!word) {
        output.textContent = "Please enter a word.";
        return;
    }

    if (explanations[word]) {
        output.textContent = word + ": " + explanations[word];
    } else {
        output.textContent =
            "Sorry, this word is not available in the demo dictionary.";
    }
}


// ===============================
// SECTION MANAGEMENT
// ===============================

function prepareSections() {
    const paragraphs = originalText
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

    documentSections = [];

    let pendingText = "";

    paragraphs.forEach(paragraph => {

        // Combine short headings with the following paragraph
        if (paragraph.length < 80 && !/[.!?]$/.test(paragraph)) {
            pendingText += paragraph + " ";
        } else {
            documentSections.push(
                (pendingText + paragraph).trim()
            );

            pendingText = "";
        }
    });

    if (pendingText.trim()) {
        documentSections.push(pendingText.trim());
    }

    // If document has no paragraphs, use the entire text
    if (documentSections.length === 0 && originalText.trim()) {
        documentSections.push(originalText.trim());
    }

    currentSectionIndex = 0;

    displaySection();
}


// ===============================
// DISPLAY CURRENT SECTION
// ===============================

async function displaySection() {
    if (documentSections.length === 0) {
        return;
    }

    const section = documentSections[currentSectionIndex];

    window.speechSynthesis.cancel();

    // Update section information
    document.getElementById("section-number").textContent =
        "Section " +
        (currentSectionIndex + 1) +
        " of " +
        documentSections.length;

    document.getElementById("section-status").textContent =
        "Showing section " +
        (currentSectionIndex + 1);


    // ===============================
    // VERBATIM MODE
    // ===============================

    if (currentMode === "verbatim") {
        currentText = section;

        readingText.textContent = section;

        readingText.classList.remove("ai-loading");

        modeTitle.textContent =
            "Verbatim - Section " +
            (currentSectionIndex + 1);

        return;
    }


    // ===============================
    // AI MODES
    // ===============================

    const modeName =
        currentMode.charAt(0).toUpperCase() +
        currentMode.slice(1);

    modeTitle.textContent =
        modeName +
        " - Section " +
        (currentSectionIndex + 1);


    // Show loading indicator
    readingText.classList.add("ai-loading");

    if (currentMode === "gist") {
        readingText.textContent =
            "🤖 AI is generating a short summary...\n\n" +
            "Please wait while AudioFlow Lite identifies the most important ideas.";
    } else {
        readingText.textContent =
            "🤖 AI is simplifying your text...\n\n" +
            "Please wait while AudioFlow Lite rewrites this section using easy English.";
    }


    // ===============================
    // CALL AI
    // ===============================

    try {
        const result = await transformWithAI(
            section,
            currentMode
        );

        currentText = result;

        readingText.textContent = result;

        readingText.classList.remove("ai-loading");

        modeTitle.textContent =
            modeName +
            " - Section " +
            (currentSectionIndex + 1);


    } catch (error) {

        currentText = section;

        readingText.textContent =
            "❌ AI processing failed.\n\n" +
            error.message +
            "\n\nPlease try again.";

        readingText.classList.remove("ai-loading");

        modeTitle.textContent = "AI Processing Error";
    }
}


// ===============================
// NEXT SECTION
// ===============================

function nextSection() {
    if (documentSections.length === 0) {
        prepareSections();
        return;
    }

    if (currentSectionIndex < documentSections.length - 1) {
        currentSectionIndex++;

        displaySection();

    } else {
        document.getElementById("section-status").textContent =
            "You have reached the last section.";
    }
}


// ===============================
// PREVIOUS SECTION
// ===============================

function previousSection() {
    if (currentSectionIndex > 0) {
        currentSectionIndex--;

        displaySection();

    } else {
        document.getElementById("section-status").textContent =
            "You are already at the first section.";
    }
}