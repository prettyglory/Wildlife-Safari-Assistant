// ============================================================
// WILDLIFE SAFARI ASSISTANT FRONTEND
// ============================================================

const API_BASE_URL = "";


// ============================================================
// APPLICATION STATE
// ============================================================

const state = {
    selectedFile: null,
    detectedAnimal: null,
    detectionConfidence: null,
    animalProfile: null,
    conversationId: null,
    history: []
};


// ============================================================
// DOM ELEMENTS
// ============================================================

const detectorStatusDot =
    document.querySelector("#detector-status-dot");

const detectorStatusText =
    document.querySelector("#detector-status-text");

const guideStatusDot =
    document.querySelector("#guide-status-dot");

const guideStatusText =
    document.querySelector("#guide-status-text");


const detectorSection =
    document.querySelector("#detector-section");

const chatSection =
    document.querySelector("#chat-section");


const heroDetectButton =
    document.querySelector("#hero-detect-button");

const heroChatButton =
    document.querySelector("#hero-chat-button");


const uploadArea =
    document.querySelector("#upload-area");

const fileInput =
    document.querySelector("#animal-image");

const chooseImageButton =
    document.querySelector("#choose-image-button");

const uploadPlaceholder =
    document.querySelector("#upload-placeholder");

const imagePreviewContainer =
    document.querySelector("#image-preview-container");

const imagePreview =
    document.querySelector("#image-preview");

const removeImageButton =
    document.querySelector("#remove-image-button");

const fileInformation =
    document.querySelector("#file-information");

const selectedFileName =
    document.querySelector("#selected-file-name");

const selectedFileSize =
    document.querySelector("#selected-file-size");

const detectButton =
    document.querySelector("#detect-button");

const detectButtonText =
    document.querySelector("#detect-button-text");

const detectorLoader =
    document.querySelector("#detector-loader");

const detectorError =
    document.querySelector("#detector-error");


const detectionResult =
    document.querySelector("#detection-result");

const detectedAnimal =
    document.querySelector("#detected-animal");

const predictionStatus =
    document.querySelector("#prediction-status");

const confidenceValue =
    document.querySelector("#confidence-value");

const confidenceLabel =
    document.querySelector("#confidence-label");

const confidenceFill =
    document.querySelector("#confidence-fill");

const matchesList =
    document.querySelector("#matches-list");


const animalContext =
    document.querySelector("#animal-context");

const contextAnimal =
    document.querySelector("#context-animal");

const clearContextButton =
    document.querySelector("#clear-context-button");


const animalProfileSection =
    document.querySelector("#animal-profile-section");

const profileAnimalName =
    document.querySelector("#profile-animal-name");

const profileScientificName =
    document.querySelector("#profile-scientific-name");

const profileHabitat =
    document.querySelector("#profile-habitat");

const profileDiet =
    document.querySelector("#profile-diet");

const profileSocial =
    document.querySelector("#profile-social");

const profileFeeding =
    document.querySelector("#profile-feeding");

const profileReproduction =
    document.querySelector("#profile-reproduction");

const profileLifespan =
    document.querySelector("#profile-lifespan");

const profileConservation =
    document.querySelector("#profile-conservation");

const askAboutAnimalButton =
    document.querySelector("#ask-about-animal-button");


const chatMessages =
    document.querySelector("#chat-messages");

const chatForm =
    document.querySelector("#chat-form");

const chatInput =
    document.querySelector("#chat-input");

const sendButton =
    document.querySelector("#send-button");

const typingIndicator =
    document.querySelector("#typing-indicator");

const conversationStatus =
    document.querySelector("#conversation-status");

const newChatButton =
    document.querySelector("#new-chat-button");

const chatError =
    document.querySelector("#chat-error");


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function capitalizeWords(value) {
    if (!value) {
        return "";
    }

    return value
        .replace(/_/g, " ")
        .replace(
            /\b\w/g,
            character => character.toUpperCase()
        );
}


function formatFileSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(1)} MB`;
}


function confidenceText(confidence) {
    if (confidence >= 80) {
        return "High confidence";
    }

    if (confidence >= 50) {
        return "Moderate confidence";
    }

    return "Low confidence";
}


function showError(element, message) {
    element.textContent = message;
    element.classList.remove("hidden");
}


function hideError(element) {
    element.textContent = "";
    element.classList.add("hidden");
}


function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ============================================================
// CHATBOT MARKDOWN FORMATTER
// ============================================================

function formatAssistantText(text) {
    const content =
        String(text || "");

    /*
     * Marked converts Markdown into HTML.
     * DOMPurify sanitizes the generated HTML.
     */
    if (
        window.marked &&
        window.DOMPurify
    ) {
        marked.setOptions({
            gfm: true,
            breaks: true
        });

        const renderedMarkdown =
            marked.parse(content);

        return DOMPurify.sanitize(
            renderedMarkdown
        );
    }

    /*
     * Fallback if Marked or DOMPurify
     * cannot be loaded.
     */
    return escapeHtml(content)
        .replace(/\n/g, "<br>");
}


// ============================================================
// SYSTEM HEALTH CHECK
// ============================================================

async function checkSystemHealth() {

    // Wildlife detector
    try {
        const response =
            await fetch(
                `${API_BASE_URL}/api/health`
            );

        if (!response.ok) {
            throw new Error(
                "Detector unavailable"
            );
        }

        const data =
            await response.json();

        if (
            data.status === "ok" &&
            data.model_exists
        ) {
            detectorStatusDot.classList.add(
                "online"
            );

            detectorStatusDot.classList.remove(
                "offline"
            );

            detectorStatusText.textContent =
                "Wildlife AI Online";
        } else {
            throw new Error(
                "Wildlife model unavailable"
            );
        }

    } catch (error) {
        detectorStatusDot.classList.add(
            "offline"
        );

        detectorStatusDot.classList.remove(
            "online"
        );

        detectorStatusText.textContent =
            "Wildlife AI Offline";
    }


    // Safari Guide
    try {
        const response =
            await fetch(
                `${API_BASE_URL}/api/safari-guide/health`
            );

        if (!response.ok) {
            throw new Error(
                "Safari Guide unavailable"
            );
        }

        const data =
            await response.json();

        if (data.connected) {
            guideStatusDot.classList.add(
                "online"
            );

            guideStatusDot.classList.remove(
                "offline"
            );

            guideStatusText.textContent =
                "Safari Guide Online";
        } else {
            throw new Error(
                "Safari Guide disconnected"
            );
        }

    } catch (error) {
        guideStatusDot.classList.add(
            "offline"
        );

        guideStatusDot.classList.remove(
            "online"
        );

        guideStatusText.textContent =
            "Safari Guide Offline";
    }
}


// ============================================================
// HERO BUTTONS
// ============================================================

heroDetectButton.addEventListener(
    "click",
    () => {
        detectorSection.scrollIntoView({
            behavior: "smooth"
        });
    }
);


heroChatButton.addEventListener(
    "click",
    () => {
        chatSection.scrollIntoView({
            behavior: "smooth"
        });

        setTimeout(
            () => chatInput.focus(),
            400
        );
    }
);


// ============================================================
// CHOOSE IMAGE
// ============================================================

chooseImageButton.addEventListener(
    "click",
    event => {
        event.preventDefault();
        event.stopPropagation();

        fileInput.click();
    }
);


uploadArea.addEventListener(
    "click",
    event => {
        /*
         * Prevent the upload area from opening
         * the file picker when clicking remove.
         */
        if (
            event.target ===
            removeImageButton
        ) {
            return;
        }

        /*
         * The Choose Image button already
         * handles its own click.
         */
        if (
            event.target ===
            chooseImageButton
        ) {
            return;
        }

        fileInput.click();
    }
);


fileInput.addEventListener(
    "change",
    () => {
        const file =
            fileInput.files[0];

        if (file) {
            selectImage(file);
        }
    }
);


// ============================================================
// SELECT IMAGE
// ============================================================

function selectImage(file) {
    hideError(detectorError);

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (
        !allowedTypes.includes(
            file.type
        )
    ) {
        showError(
            detectorError,
            "Please choose a JPG, JPEG, PNG or WEBP image."
        );

        return;
    }

    state.selectedFile =
        file;

    selectedFileName.textContent =
        file.name;

    selectedFileSize.textContent =
        formatFileSize(
            file.size
        );

    fileInformation.classList.remove(
        "hidden"
    );

    const reader =
        new FileReader();

    reader.onload =
        event => {
            imagePreview.src =
                event.target.result;

            uploadPlaceholder.classList.add(
                "hidden"
            );

            imagePreviewContainer.classList.remove(
                "hidden"
            );

            detectButton.disabled =
                false;
        };

    reader.readAsDataURL(
        file
    );
}


// ============================================================
// REMOVE IMAGE
// ============================================================

removeImageButton.addEventListener(
    "click",
    event => {
        event.preventDefault();
        event.stopPropagation();

        clearSelectedImage();
    }
);


function clearSelectedImage() {
    state.selectedFile =
        null;

    fileInput.value =
        "";

    imagePreview.src =
        "";

    uploadPlaceholder.classList.remove(
        "hidden"
    );

    imagePreviewContainer.classList.add(
        "hidden"
    );

    fileInformation.classList.add(
        "hidden"
    );

    detectButton.disabled =
        true;

    detectionResult.classList.add(
        "hidden"
    );

    hideError(
        detectorError
    );
}


// ============================================================
// DRAG AND DROP
// ============================================================

[
    "dragenter",
    "dragover"
].forEach(
    eventName => {
        uploadArea.addEventListener(
            eventName,
            event => {
                event.preventDefault();

                uploadArea.classList.add(
                    "dragging"
                );
            }
        );
    }
);


[
    "dragleave",
    "drop"
].forEach(
    eventName => {
        uploadArea.addEventListener(
            eventName,
            event => {
                event.preventDefault();

                uploadArea.classList.remove(
                    "dragging"
                );
            }
        );
    }
);


uploadArea.addEventListener(
    "drop",
    event => {
        const file =
            event.dataTransfer.files[0];

        if (file) {
            selectImage(file);
        }
    }
);


// ============================================================
// ANIMAL DETECTION
// ============================================================

detectButton.addEventListener(
    "click",
    detectWildlife
);


async function detectWildlife() {
    if (!state.selectedFile) {
        return;
    }

    hideError(
        detectorError
    );

    detectButton.disabled =
        true;

    detectButtonText.textContent =
        "Analyzing wildlife...";

    detectorLoader.classList.remove(
        "hidden"
    );

    const formData =
        new FormData();

    formData.append(
        "file",
        state.selectedFile
    );

    try {
        const response =
            await fetch(
                `${API_BASE_URL}/api/detect`,
                {
                    method: "POST",
                    body: formData
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail ||
                "Animal detection failed."
            );
        }

        renderDetection(
            data
        );

        if (
            data.supported &&
            data.animal
        ) {
            state.detectedAnimal =
                data.animal;

            state.detectionConfidence =
                data.confidence;

            setAnimalContext(
                data.animal,
                data.confidence
            );

            await loadAnimalProfile(
                data.animal
            );

        } else {
            clearAnimalContext();

            animalProfileSection.classList.add(
                "hidden"
            );
        }

    } catch (error) {
        showError(
            detectorError,
            error.message
        );

    } finally {
        detectButton.disabled =
            false;

        detectButtonText.textContent =
            "Detect Animal";

        detectorLoader.classList.add(
            "hidden"
        );
    }
}


// ============================================================
// RENDER DETECTION RESULT
// ============================================================

function renderDetection(data) {
    detectionResult.classList.remove(
        "hidden"
    );

    const animalName =
        data.supported
            ? data.animal
            : data.predicted_class;

    detectedAnimal.textContent =
        data.supported
            ? capitalizeWords(
                animalName
            )
            : "Unsupported / Uncertain";

    confidenceValue.textContent =
        `${Number(
            data.confidence
        ).toFixed(2)}%`;

    confidenceLabel.textContent =
        confidenceText(
            data.confidence
        );

    confidenceFill.style.width =
        `${Math.min(
            Number(
                data.confidence
            ),
            100
        )}%`;

    if (data.supported) {
        predictionStatus.textContent =
            `Recognized as ${capitalizeWords(
                data.animal
            )}.`;
    } else {
        predictionStatus.textContent =
            `Best model match: ${capitalizeWords(
                data.predicted_class
            )}, but confidence is below the ${data.threshold}% recognition threshold.`;
    }

    renderTopMatches(
        data.top_matches || []
    );
}


// ============================================================
// TOP MATCHES
// ============================================================

function renderTopMatches(matches) {
    matchesList.innerHTML =
        "";

    matches.forEach(
        match => {
            const element =
                document.createElement(
                    "div"
                );

            element.className =
                "match-item";

            element.innerHTML = `
                <span class="match-name">
                    ${escapeHtml(
                        capitalizeWords(
                            match.animal
                        )
                    )}
                </span>

                <span class="match-score">
                    ${Number(
                        match.confidence
                    ).toFixed(2)}%
                </span>
            `;

            matchesList.appendChild(
                element
            );
        }
    );
}


// ============================================================
// LOAD ANIMAL PROFILE
// ============================================================

async function loadAnimalProfile(
    animal
) {
    try {
        const response =
            await fetch(
                `${API_BASE_URL}/api/animals/${encodeURIComponent(
                    animal
                )}`
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail ||
                "Animal profile could not be loaded."
            );
        }

        state.animalProfile =
            data;

        renderAnimalProfile(
            data
        );

    } catch (error) {
        console.error(
            "Profile error:",
            error
        );
    }
}


// ============================================================
// RENDER ANIMAL PROFILE
// ============================================================

function renderAnimalProfile(
    profile
) {
    profileAnimalName.textContent =
        capitalizeWords(
            profile.animal
        );

    profileScientificName.textContent =
        profile.scientific_name ||
        "Scientific name unavailable";

    profileHabitat.textContent =
        profile.habitat ||
        "Information unavailable.";

    profileDiet.textContent =
        profile.diet ||
        "Information unavailable.";

    profileSocial.textContent =
        profile.social_behavior ||
        "Information unavailable.";

    profileFeeding.textContent =
        profile.food_acquisition ||
        "Information unavailable.";

    profileReproduction.textContent =
        profile.reproduction ||
        "Information unavailable.";

    profileLifespan.textContent =
        profile.lifespan ||
        "Information unavailable.";

    profileConservation.textContent =
        profile.conservation ||
        "Information unavailable.";

    animalProfileSection.classList.remove(
        "hidden"
    );
}


// ============================================================
// ANIMAL CONTEXT
// ============================================================

function setAnimalContext(
    animal,
    confidence
) {
    state.detectedAnimal =
        animal;

    state.detectionConfidence =
        confidence;

    contextAnimal.textContent =
        `${capitalizeWords(
            animal
        )} · ${Number(
            confidence
        ).toFixed(2)}%`;

    animalContext.classList.remove(
        "hidden"
    );

    conversationStatus.textContent =
        `Using ${capitalizeWords(
            animal
        )} context`;
}


function clearAnimalContext() {
    state.detectedAnimal =
        null;

    state.detectionConfidence =
        null;

    state.animalProfile =
        null;

    contextAnimal.textContent =
        "";

    animalContext.classList.add(
        "hidden"
    );

    conversationStatus.textContent =
        "Ready";
}


clearContextButton.addEventListener(
    "click",
    clearAnimalContext
);


// ============================================================
// ASK SAFARI GUIDE ABOUT DETECTED ANIMAL
// ============================================================

askAboutAnimalButton.addEventListener(
    "click",
    () => {
        if (
            !state.detectedAnimal
        ) {
            return;
        }

        chatInput.value =
            `Tell me about ${capitalizeWords(
                state.detectedAnimal
            )} and where I can see them in Tanzania.`;

        resizeChatInput();

        chatSection.scrollIntoView({
            behavior: "smooth"
        });

        setTimeout(
            () => chatInput.focus(),
            400
        );
    }
);


// ============================================================
// CHAT MESSAGE RENDERING
// ============================================================

function renderMessage(
    role,
    text
) {
    const message =
        document.createElement(
            "div"
        );

    message.className =
        `message ${
            role === "user"
                ? "user-message"
                : "assistant-message"
        }`;

    const avatar =
        role === "user"
            ? "👤"
            : "🧭";

    const author =
        role === "user"
            ? "You"
            : "Safari Guide";

    let formattedContent;

    if (
        role === "assistant"
    ) {
        formattedContent = `
            <div class="assistant-response">
                ${formatAssistantText(
                    text
                )}
            </div>
        `;
    } else {
        formattedContent = `
            <p>
                ${escapeHtml(
                    text
                ).replace(
                    /\n/g,
                    "<br>"
                )}
            </p>
        `;
    }

    message.innerHTML = `
        <div class="message-avatar">
            ${avatar}
        </div>

        <div class="message-content">

            <span class="message-author">
                ${author}
            </span>

            ${formattedContent}

        </div>
    `;

    chatMessages.appendChild(
        message
    );

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


// ============================================================
// CHAT FORM
// ============================================================

chatForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        const message =
            chatInput.value.trim();

        if (!message) {
            return;
        }

        await sendChatMessage(
            message
        );
    }
);


// ============================================================
// SEND CHAT MESSAGE
// ============================================================

async function sendChatMessage(
    message
) {
    hideError(
        chatError
    );

    renderMessage(
        "user",
        message
    );

    chatInput.value =
        "";

    resizeChatInput();

    typingIndicator.classList.remove(
        "hidden"
    );

    sendButton.disabled =
        true;

    conversationStatus.textContent =
        "Safari Guide is thinking...";

    const requestBody = {
        message,

        history:
            state.history,

        conversation_id:
            state.conversationId,

        animal_context:
            state.detectedAnimal
                ? {
                    animal:
                        state.detectedAnimal,

                    confidence:
                        state.detectionConfidence
                }
                : null
    };

    try {
        const response =
            await fetch(
                `${API_BASE_URL}/api/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail ||
                "Safari Guide could not answer."
            );
        }

        renderMessage(
            "assistant",
            data.reply
        );

        state.conversationId =
            data.conversation_id;

        state.history.push(
            {
                role: "user",
                content: message
            },
            {
                role: "assistant",
                content: data.reply
            }
        );

        conversationStatus.textContent =
            state.detectedAnimal
                ? `Using ${capitalizeWords(
                    state.detectedAnimal
                )} context`
                : "Connected";

    } catch (error) {
        showError(
            chatError,
            error.message
        );

        conversationStatus.textContent =
            "Connection error";

    } finally {
        typingIndicator.classList.add(
            "hidden"
        );

        sendButton.disabled =
            false;

        chatInput.focus();
    }
}


// ============================================================
// SUGGESTED CHAT PROMPTS
// ============================================================

document
    .querySelectorAll(
        ".prompt-chip"
    )
    .forEach(
        button => {
            button.addEventListener(
                "click",
                () => {
                    const prompt =
                        button.dataset.prompt;

                    chatInput.value =
                        prompt;

                    resizeChatInput();

                    chatInput.focus();
                }
            );
        }
    );


// ============================================================
// NEW CONVERSATION
// ============================================================

newChatButton.addEventListener(
    "click",
    () => {
        state.conversationId =
            null;

        state.history =
            [];

        chatMessages.innerHTML = `
            <div class="message assistant-message">

                <div class="message-avatar">
                    🧭
                </div>

                <div class="message-content">

                    <span class="message-author">
                        Safari Guide
                    </span>

                    <div class="assistant-response">
                        <p>
                            New conversation started.
                            Ask me anything about Tanzania's
                            wildlife and safari destinations.
                        </p>
                    </div>

                </div>

            </div>
        `;

        conversationStatus.textContent =
            state.detectedAnimal
                ? `Using ${capitalizeWords(
                    state.detectedAnimal
                )} context`
                : "Ready";

        hideError(
            chatError
        );

        chatInput.focus();
    }
);


// ============================================================
// TEXTAREA AUTO RESIZE
// ============================================================

function resizeChatInput() {
    chatInput.style.height =
        "auto";

    chatInput.style.height =
        `${Math.min(
            chatInput.scrollHeight,
            130
        )}px`;
}


chatInput.addEventListener(
    "input",
    resizeChatInput
);


// ============================================================
// ENTER TO SEND
// SHIFT + ENTER FOR NEW LINE
// ============================================================

chatInput.addEventListener(
    "keydown",
    event => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            chatForm.requestSubmit();
        }
    }
);


// ============================================================
// APPLICATION INITIALIZATION
// ============================================================

async function initializeApplication() {
    conversationStatus.textContent =
        "Checking services...";

    await checkSystemHealth();

    conversationStatus.textContent =
        state.detectedAnimal
            ? `Using ${capitalizeWords(
                state.detectedAnimal
            )} context`
            : "Ready";
}


initializeApplication();