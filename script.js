// Tender Package Checker
// Basic foundation only.
// PDF processing, matching, validation, duplicate detection,
// and package generation will be added in later steps.

const languageButtons = document.querySelectorAll(".language-btn");
const requirementsFileInput = document.getElementById("requirements-file");
const pdfFilesInput = document.getElementById("pdf-files");

const tenderDetails = document.getElementById("tender-details");
const tenderIdElement = document.getElementById("tender-id");
const tenderTitleElement = document.getElementById("tender-title");
const procuringEntityElement = document.getElementById("procuring-entity");
const bidderElement = document.getElementById("bidder");
const submissionDeadlineElement = document.getElementById("submission-deadline");

const requirementsEmpty = document.getElementById("requirements-empty");
const requirementsTableWrapper = document.getElementById(
    "requirements-table-wrapper"
);
const requirementsList = document.getElementById("requirements-list");

const uploadedListContainer = document.getElementById(
    "uploaded-list-container"
);
const uploadedFiles = document.getElementById("uploaded-files");
const fileCount = document.getElementById("file-count");

const validationMessage = document.getElementById("validation-message");
const generateButton = document.getElementById("generate-button");

// Basic application state.
// This will be expanded when the actual processing features are implemented.
const appState = {
    language: "en",
    tender: null,
    requirements: [],
    uploadedFiles: []
};


// --------------------------------------------------
// Language Switcher
// --------------------------------------------------

// At this stage it only changes the active button.
// Full UI translation will be implemented later.

languageButtons.forEach((button) => {
    button.addEventListener("click", () => {

        languageButtons.forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        appState.language = button.dataset.language;
    });
});


// --------------------------------------------------
// Load requirements.json
// --------------------------------------------------

requirementsFileInput.addEventListener(
    "change",
    handleRequirementsFile
);

async function handleRequirementsFile(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    try {

        const text = await file.text();

        const data = JSON.parse(text);

        if (!data.tender || !Array.isArray(data.requirements)) {
            throw new Error("Invalid requirements.json format.");
        }

        appState.tender = data.tender;

        // Sort requirements according to their order.
        appState.requirements = [...data.requirements].sort(
            (a, b) => a.order - b.order
        );

        renderTender();
        renderRequirements();

    } catch (error) {

        alert(
            `Could not load requirements.json: ${error.message}`
        );
    }
}


// --------------------------------------------------
// Display Tender Information
// --------------------------------------------------

function renderTender() {

    const tender = appState.tender;

    tenderDetails.classList.remove("hidden");

    tenderIdElement.textContent =
        tender.tender_id || "—";

    tenderTitleElement.textContent =
        tender.title || "—";

    procuringEntityElement.textContent =
        tender.procuring_entity || "—";

    bidderElement.textContent =
        tender.bidder || "—";

    submissionDeadlineElement.textContent =
        tender.submission_deadline || "—";
}


// --------------------------------------------------
// Display Requirements
// --------------------------------------------------

function renderRequirements() {

    requirementsList.innerHTML = "";

    if (appState.requirements.length === 0) {

        requirementsEmpty.classList.remove("hidden");
        requirementsTableWrapper.classList.add("hidden");

        return;
    }

    requirementsEmpty.classList.add("hidden");
    requirementsTableWrapper.classList.remove("hidden");

    appState.requirements.forEach((requirement) => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${requirement.order}</td>

            <td>
                ${escapeHtml(
                    requirement.title_en ||
                    "Untitled document"
                )}
            </td>

            <td>
                ${
                    requirement.mandatory
                        ? "Required"
                        : "Optional"
                }
            </td>

            <td>
                ${
                    requirement.has_expiry
                        ? "Required"
                        : "Not required"
                }
            </td>

            <td>—</td>

            <td>
                <span class="status-placeholder">
                    Not checked
                </span>
            </td>
        `;

        requirementsList.appendChild(row);
    });
}


// --------------------------------------------------
// PDF File Selection
// --------------------------------------------------

// The actual PDF validation and page counting
// will be added later.

pdfFilesInput.addEventListener(
    "change",
    handlePdfSelection
);

function handlePdfSelection(event) {

    const selectedFiles = Array.from(
        event.target.files
    );

    if (selectedFiles.length === 0) {
        return;
    }

    appState.uploadedFiles.push(
        ...selectedFiles
    );

    renderUploadedFiles();

    // Allows the same file to be selected again later.
    pdfFilesInput.value = "";
}


// --------------------------------------------------
// Display Uploaded Files
// --------------------------------------------------

function renderUploadedFiles() {

    uploadedFiles.innerHTML = "";

    if (appState.uploadedFiles.length === 0) {

        uploadedListContainer.classList.add("hidden");

        fileCount.textContent = "0 files";

        return;
    }

    uploadedListContainer.classList.remove("hidden");

    fileCount.textContent =
        `${appState.uploadedFiles.length} file${
            appState.uploadedFiles.length === 1
                ? ""
                : "s"
        }`;

    appState.uploadedFiles.forEach(
        (file, index) => {

            const row =
                document.createElement("div");

            row.className = "file-row";

            row.innerHTML = `
                <div class="file-info">

                    <span class="file-name">
                        ${escapeHtml(file.name)}
                    </span>

                    <span class="file-meta">
                        ${formatFileSize(file.size)}
                        • PDF processing pending
                    </span>

                </div>

                <button
                    class="button button-secondary"
                    type="button"
                    data-file-index="${index}"
                >
                    Remove
                </button>
            `;

            row
                .querySelector("button")
                .addEventListener("click", () => {

                    appState.uploadedFiles.splice(
                        index,
                        1
                    );

                    renderUploadedFiles();
                });

            uploadedFiles.appendChild(row);
        }
    );
}


// --------------------------------------------------
// Format File Size
// --------------------------------------------------

function formatFileSize(bytes) {

    if (bytes < 1024 * 1024) {

        return `${Math.round(
            bytes / 1024
        )} KB`;
    }

    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(1)} MB`;
}


// --------------------------------------------------
// Escape HTML
// --------------------------------------------------

// Prevent HTML from being inserted directly
// when file/JSON values are displayed.

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// --------------------------------------------------
// Generate Button
// --------------------------------------------------

// Keep the Generate button disabled in the foundation.
// It will be enabled after validation logic is implemented.

generateButton.disabled = true;

validationMessage.textContent =
    "Load a tender and upload documents to begin the validation workflow.";