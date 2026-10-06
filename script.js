// ======================================================
// TENDER PACKAGE CHECKER
//
// Current features:
//
// 1. Load requirements.json
// 2. Upload PDF files
// 3. Count PDF pages
// 4. Remove PDF files
// 5. Match files to requirements
// 6. Change or undo matches
//
// Not implemented yet:
//
// - Expiry date validation
// - Duplicate detection
// - Final status rules
// - PDF merging
// - Cover page
// - Footer
// - Final download
// ======================================================



// ======================================================
// DOM ELEMENTS
// ======================================================

const languageButtons =
    document.querySelectorAll(".language-btn");


const requirementsFileInput =
    document.getElementById(
        "requirements-file"
    );


const pdfFilesInput =
    document.getElementById(
        "pdf-files"
    );


const tenderDetails =
    document.getElementById(
        "tender-details"
    );


const tenderIdElement =
    document.getElementById(
        "tender-id"
    );


const tenderTitleElement =
    document.getElementById(
        "tender-title"
    );


const procuringEntityElement =
    document.getElementById(
        "procuring-entity"
    );


const bidderElement =
    document.getElementById(
        "bidder"
    );


const submissionDeadlineElement =
    document.getElementById(
        "submission-deadline"
    );


const requirementsEmpty =
    document.getElementById(
        "requirements-empty"
    );


const requirementsTableWrapper =
    document.getElementById(
        "requirements-table-wrapper"
    );


const requirementsList =
    document.getElementById(
        "requirements-list"
    );


const requirementsCount =
    document.getElementById(
        "requirements-count"
    );


const uploadedListContainer =
    document.getElementById(
        "uploaded-list-container"
    );


const uploadedFiles =
    document.getElementById(
        "uploaded-files"
    );


const fileCount =
    document.getElementById(
        "file-count"
    );


const validationMessage =
    document.getElementById(
        "validation-message"
    );


const generateButton =
    document.getElementById(
        "generate-button"
    );



// ======================================================
// APPLICATION STATE
// ======================================================

const appState = {

    // Current language
    language: "en",


    // Tender information
    tender: null,


    // Requirements from JSON
    requirements: [],


    // Uploaded PDF files
    uploadedFiles: [],


    // Matches
    //
    // Example:
    //
    // {
    //     "requirement-id-1": "file-id-1",
    //     "requirement-id-2": "file-id-3"
    // }
    //
    matches: {}

};



// ======================================================
// LIMITS
// ======================================================

const MAX_FILES = 30;

const MAX_TOTAL_SIZE =
    50 * 1024 * 1024; // 50 MB



// ======================================================
// LANGUAGE SWITCHER
// ======================================================

languageButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                // Remove active state
                // from all buttons.
                languageButtons.forEach(
                    (item) => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                // Activate selected button.
                button.classList.add(
                    "active"
                );


                // Save selected language.
                appState.language =
                    button.dataset.language;


                // Refresh document names.
                renderRequirements();

                renderUploadedFiles();

            }
        );

    }
);



// ======================================================
// TASK 1
// LOAD requirements.json
// ======================================================

requirementsFileInput.addEventListener(
    "change",
    handleRequirementsFile
);



async function handleRequirementsFile(
    event
) {

    const file =
        event.target.files[0];


    if (!file) {

        return;

    }


    try {

        // Read JSON file.
        const text =
            await file.text();


        // Convert JSON text
        // into JavaScript object.
        const data =
            JSON.parse(text);


        // Check basic structure.
        if (
            !data.tender ||
            !Array.isArray(
                data.requirements
            )
        ) {

            throw new Error(
                "Invalid requirements.json format."
            );

        }


        // Store tender information.
        appState.tender =
            data.tender;


        // Store requirements.
        //
        // The spread operator creates
        // a new array.
        appState.requirements =
            [
                ...data.requirements
            ];


        // Sort by order.
        appState.requirements.sort(
            (a, b) =>
                a.order - b.order
        );


        // Clear old matches
        // when a new tender is loaded.
        appState.matches = {};


        // Display information.
        renderTender();

        renderRequirements();

        updateValidationMessage();

    }


    catch (error) {

        alert(
            `Could not load requirements.json: ${error.message}`
        );

    }

}



// ======================================================
// DISPLAY TENDER INFORMATION
// ======================================================

function renderTender() {

    const tender =
        appState.tender;


    if (!tender) {

        return;

    }


    // Show the tender details section.
    tenderDetails.classList.remove(
        "hidden"
    );


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



// ======================================================
// TASK 1
// DISPLAY REQUIREMENTS
// ======================================================

function renderRequirements() {

    // Clear previous table rows.
    requirementsList.innerHTML = "";


    // No requirements.
    if (
        appState.requirements.length === 0
    ) {

        requirementsEmpty.classList.remove(
            "hidden"
        );

        requirementsTableWrapper.classList.add(
            "hidden"
        );

        requirementsCount.textContent =
            "0 / 0 OK";

        return;

    }


    // Show table.
    requirementsEmpty.classList.add(
        "hidden"
    );

    requirementsTableWrapper.classList.remove(
        "hidden"
    );


    // Create one row for each requirement.
    appState.requirements.forEach(
        (requirement) => {

            const row =
                document.createElement(
                    "tr"
                );


            // Get the file matched
            // to this requirement.
            const matchedFile =
                getMatchedFile(
                    requirement.id
                );


            // Select title according
            // to current language.
            const documentTitle =
                appState.language === "bn"
                    ? requirement.title_bn
                    : requirement.title_en;


            row.innerHTML = `

                <td>
                    ${requirement.order}
                </td>


                <td>
                    ${escapeHtml(
                        documentTitle ||
                        "Untitled document"
                    )}
                </td>


                <td>

                    <span class="requirement-type">

                        ${
                            requirement.mandatory
                                ? "Required"
                                : "Optional"

                        }

                    </span>

                </td>


                <td>

                    ${
                        requirement.has_expiry
                            ? "Required"
                            : "Not required"

                    }

                </td>


                <td class="match-cell">

                    ${createMatchSelect(
                        requirement
                    )}

                </td>


                <td>

                    <span class="status-placeholder">

                        ${
                            matchedFile
                                ? "Matched"
                                : "Not matched"

                        }

                    </span>

                </td>

            `;


            requirementsList.appendChild(
                row
            );


            // Find dropdown.
            const select =
                row.querySelector(
                    ".match-select"
                );


            if (select) {

                select.addEventListener(
                    "change",
                    (event) => {

                        const fileId =
                            event.target.value;


                        // Empty selection
                        // means undo match.
                        if (
                            fileId === ""
                        ) {

                            removeMatch(
                                requirement.id
                            );

                        }


                        else {

                            matchFile(
                                requirement.id,
                                fileId
                            );

                        }


                        // Refresh interface.
                        renderRequirements();

                        renderUploadedFiles();

                        updateValidationMessage();

                    }
                );

            }

        }
    );


    updateRequirementCount();

}



// ======================================================
// CREATE MATCH DROPDOWN
// ======================================================

function createMatchSelect(
    requirement
) {

    // Get current match.
    const currentFileId =
        appState.matches[
            requirement.id
        ] || "";


    let html = `

        <select
            class="match-select"
            aria-label="Match file"
        >

            <option value="">
                Select PDF
            </option>

    `;


    // Add uploaded files
    // to dropdown.
    appState.uploadedFiles.forEach(
        (file) => {

            // Check whether file
            // is already used.
            const usedBy =
                getRequirementForFile(
                    file.id
                );


            // File is available if:
            //
            // 1. It is not matched.
            //
            // OR
            //
            // 2. It is already matched
            //    to this requirement.
            const available =
                !usedBy ||
                usedBy === requirement.id;


            if (available) {

                const selected =
                    currentFileId === file.id
                        ? "selected"
                        : "";


                html += `

                    <option
                        value="${file.id}"
                        ${selected}
                    >
                        ${escapeHtml(
                            file.name
                        )}
                    </option>

                `;

            }

        }
    );


    html += `

        </select>

    `;


    return html;

}



// ======================================================
// TASK 3
// MATCH FILE TO REQUIREMENT
// ======================================================

function matchFile(
    requirementId,
    fileId
) {

    // Check whether the selected
    // file is already used.
    const oldRequirement =
        getRequirementForFile(
            fileId
        );


    // If it is already assigned
    // somewhere else, remove
    // the old match.
    if (oldRequirement) {

        delete appState.matches[
            oldRequirement
        ];

    }


    // Remove previous match
    // of this requirement.
    delete appState.matches[
        requirementId
    ];


    // Create new match.
    appState.matches[
        requirementId
    ] = fileId;

}



// ======================================================
// TASK 3
// REMOVE MATCH
// ======================================================

function removeMatch(
    requirementId
) {

    delete appState.matches[
        requirementId
    ];

}



// ======================================================
// GET MATCHED FILE
// ======================================================

function getMatchedFile(
    requirementId
) {

    const fileId =
        appState.matches[
            requirementId
        ];


    if (!fileId) {

        return null;

    }


    return appState.uploadedFiles.find(
        (file) =>
            file.id === fileId
    ) || null;

}



// ======================================================
// FIND REQUIREMENT USING A FILE
// ======================================================

function getRequirementForFile(
    fileId
) {

    for (
        const requirementId
        in appState.matches
    ) {

        if (
            appState.matches[
                requirementId
            ] === fileId
        ) {

            return requirementId;

        }

    }


    return null;

}



// ======================================================
// TASK 2
// UPLOAD PDF FILES
// ======================================================

pdfFilesInput.addEventListener(
    "change",
    handlePdfSelection
);



async function handlePdfSelection(
    event
) {

    const selectedFiles =
        Array.from(
            event.target.files
        );


    if (
        selectedFiles.length === 0
    ) {

        return;

    }


    // ----------------------------------------------
    // Check maximum file count
    // ----------------------------------------------

    if (
        appState.uploadedFiles.length +
        selectedFiles.length >
        MAX_FILES
    ) {

        alert(
            `You can upload a maximum of ${MAX_FILES} PDF files.`
        );


        pdfFilesInput.value = "";

        return;

    }



    // ----------------------------------------------
    // Check file types
    // ----------------------------------------------

    for (
        const file of selectedFiles
    ) {

        const isPdf =
            file.type ===
                "application/pdf" ||

            file.name
                .toLowerCase()
                .endsWith(".pdf");


        if (!isPdf) {

            alert(
                `"${file.name}" is not a PDF file. Only PDF files are allowed.`
            );


            pdfFilesInput.value = "";

            return;

        }

    }



    // ----------------------------------------------
    // Check total file size
    // ----------------------------------------------

    const selectedSize =
        selectedFiles.reduce(
            (total, file) =>
                total + file.size,
            0
        );


    const newTotalSize =
        getTotalFileSize() +
        selectedSize;


    if (
        newTotalSize >
        MAX_TOTAL_SIZE
    ) {

        alert(
            "The total size of uploaded files cannot exceed 50 MB."
        );


        pdfFilesInput.value = "";

        return;

    }



    // ----------------------------------------------
    // Add files
    // ----------------------------------------------

    for (
        const file of selectedFiles
    ) {

        // Create a simple
        // unique identifier.
        const fileId =
            `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 9)}`;


        const fileObject = {

            id: fileId,

            file: file,

            name: file.name,

            size: file.size,

            pageCount: null

        };


        // Count PDF pages.
        fileObject.pageCount =
            await getPdfPageCount(
                file
            );


        // Save file information.
        appState.uploadedFiles.push(
            fileObject
        );

    }



    // Refresh interface.
    renderUploadedFiles();

    renderRequirements();

    updateValidationMessage();


    // Clear input.
    //
    // This allows the same file
    // to be selected again later.
    pdfFilesInput.value = "";

}



// ======================================================
// GET TOTAL FILE SIZE
// ======================================================

function getTotalFileSize() {

    return appState.uploadedFiles.reduce(
        (total, file) =>
            total + file.size,
        0
    );

}



// ======================================================
// COUNT PDF PAGES USING PDF.JS
// ======================================================

async function getPdfPageCount(
    file
) {

    try {

        // Make sure PDF.js loaded.
        if (
            typeof window.pdfjsLib ===
            "undefined"
        ) {

            console.warn(
                "PDF.js is not available."
            );

            return null;

        }


        // Convert file into
        // ArrayBuffer.
        const arrayBuffer =
            await file.arrayBuffer();


        // Load PDF.
        const pdf =
            await window.pdfjsLib
                .getDocument({
                    data: arrayBuffer
                })
                .promise;


        // Return number of pages.
        return pdf.numPages;

    }


    catch (error) {

        console.error(
            "Could not read PDF:",
            error
        );


        return null;

    }

}



// ======================================================
// DISPLAY UPLOADED FILES
// ======================================================

function renderUploadedFiles() {

    // Clear previous list.
    uploadedFiles.innerHTML = "";


    // No files.
    if (
        appState.uploadedFiles.length === 0
    ) {

        uploadedListContainer.classList.add(
            "hidden"
        );


        fileCount.textContent =
            "0 files";


        return;

    }


    // Show list.
    uploadedListContainer.classList.remove(
        "hidden"
    );


    fileCount.textContent =
        `${appState.uploadedFiles.length} file${
            appState.uploadedFiles.length === 1
                ? ""
                : "s"
        }`;



    // Create one row per file.
    appState.uploadedFiles.forEach(
        (fileObject) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "file-row";


            // Find whether this file
            // has been matched.
            const matchedRequirementId =
                getRequirementForFile(
                    fileObject.id
                );


            const matchedRequirement =
                appState.requirements.find(
                    (requirement) =>
                        requirement.id ===
                        matchedRequirementId
                );


            let matchText =
                "Not matched";


            if (
                matchedRequirement
            ) {

                matchText =
                    appState.language === "bn"

                        ? matchedRequirement.title_bn

                        : matchedRequirement.title_en;

            }



            // Page count text.
            const pageText =
                fileObject.pageCount !== null

                    ? `${fileObject.pageCount} pages`

                    : "Page count unavailable";



            row.innerHTML = `

                <div class="file-info">

                    <span class="file-name">

                        ${escapeHtml(
                            fileObject.name
                        )}

                    </span>


                    <span class="file-meta">

                        ${formatFileSize(
                            fileObject.size
                        )}

                        •

                        ${pageText}

                    </span>


                    <span class="file-match">

                        ${
                            matchedRequirement

                                ? `Matched: ${escapeHtml(
                                    matchText
                                )}`

                                : "Not matched"
                        }

                    </span>

                </div>


                <button
                    class="button button-secondary"
                    type="button"
                >
                    Remove
                </button>

            `;



            // Remove button.
            row
                .querySelector("button")
                .addEventListener(
                    "click",
                    () => {

                        removeUploadedFile(
                            fileObject.id
                        );

                    }
                );



            uploadedFiles.appendChild(
                row
            );

        }
    );

}



// ======================================================
// REMOVE UPLOADED FILE
// ======================================================

function removeUploadedFile(
    fileId
) {

    // Find requirement using
    // this file.
    const requirementId =
        getRequirementForFile(
            fileId
        );


    // Remove match first.
    if (requirementId) {

        delete appState.matches[
            requirementId
        ];

    }


    // Remove file from array.
    appState.uploadedFiles =
        appState.uploadedFiles.filter(
            (file) =>
                file.id !== fileId
        );


    // Refresh interface.
    renderUploadedFiles();

    renderRequirements();

    updateValidationMessage();

}



// ======================================================
// UPDATE REQUIREMENT COUNT
// ======================================================

function updateRequirementCount() {

    const total =
        appState.requirements.length;


    const matched =
        Object.keys(
            appState.matches
        ).length;


    requirementsCount.textContent =
        `${matched} / ${total} matched`;

}



// ======================================================
// VALIDATION MESSAGE
// ======================================================
//
// This is only a temporary message for the
// current development stage.
//
// Full validation will be implemented later.
// ======================================================

function updateValidationMessage() {

    // No tender loaded.
    if (!appState.tender) {

        validationMessage.textContent =
            "Load a tender and upload documents to begin the validation workflow.";

        return;

    }


    // No requirements.
    if (
        appState.requirements.length === 0
    ) {

        validationMessage.textContent =
            "No requirements were loaded.";

        return;

    }


    const matchedCount =
        Object.keys(
            appState.matches
        ).length;


    const totalRequirements =
        appState.requirements.length;


    const totalFiles =
        appState.uploadedFiles.length;


    validationMessage.textContent =
        `${matchedCount} of ${totalRequirements} requirements matched. ${totalFiles} PDF file${totalFiles === 1 ? "" : "s"} uploaded.`;

}



// ======================================================
// FORMAT FILE SIZE
// ======================================================

function formatFileSize(
    bytes
) {

    if (
        bytes < 1024 * 1024
    ) {

        return `${Math.round(
            bytes / 1024
        )} KB`;

    }


    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(1)} MB`;

}



// ======================================================
// ESCAPE HTML
// ======================================================
//
// This prevents file names or JSON values
// from being interpreted as HTML.
// ======================================================

function escapeHtml(
    value
) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}



// ======================================================
// INITIAL STATE
// ======================================================

generateButton.disabled = true;


validationMessage.textContent =
    "Load a tender and upload documents to begin the validation workflow.";