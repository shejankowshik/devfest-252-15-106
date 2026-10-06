/* Tender Package Checker: all PDF work stays in this browser. */
(() => {
  "use strict";

  const MAX_FILES = 30;
  const MAX_BYTES = 50 * 1024 * 1024;
  const $ = (id) => document.getElementById(id);
  const state = {
    language: "en",
    tender: null,
    requirements: [],
    files: [],
    matches: new Map(),
    expiryDates: new Map()
  };

  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }

  const text = {
    en: {
      eyebrow: "TENDER DOCUMENT WORKSPACE",
      appTitle: "Tender Package Checker",
      appSubtitle: "Prepare, validate, and generate a complete tender package.",
      tenderInfo: "Tender information",
      loadRequirements: "Load tender requirements",
      loadHelp: "Choose the requirements.json file supplied for this tender.",
      chooseJson: "Choose requirements.json",
      requiredDocs: "Required documents",
      requirementsEmpty: "Load requirements.json to see the required documents.",
      document: "Document",
      requirement: "Requirement",
      expiry: "Expiry",
      matchedFile: "Matched file",
      status: "Status",
      uploadedDocs: "Uploaded documents",
      uploadPdfs: "Upload PDF files",
      uploadHelp: "Add the documents you want to match to tender requirements.",
      choosePdfs: "Choose PDF files",
      limits: "PDF only · Up to 30 files · 50 MB total",
      files: "Files",
      validationSummary: "Validation summary",
      valid: "OK",
      notProvided: "Not provided",
      blockingIssues: "Blocking issues",
      generate: "Generate package PDF",
      generateHelp: "Load requirements and resolve all blocking issues to generate.",
      privacyNote: "Files are processed locally in your browser and are not uploaded.",
      tenderId: "Tender ID",
      tenderTitle: "Tender title",
      entity: "Procuring entity",
      bidder: "Bidder",
      deadline: "Submission deadline",
      required: "Required",
      optional: "Optional",
      notRequired: "Not required",
      selectPdf: "Select PDF",
      expiryNeeded: "Expiry date needed",
      expired: "Expired",
      missing: "Missing",
      ok: "OK",
      matched: "Matched",
      page: "page",
      pages: "pages",
      remove: "Remove",
      duplicate: "Duplicate content",
      badPdf: "Could not read this PDF. Please choose a valid, unencrypted PDF.",
      invalidJson: "Invalid requirements file. It must contain a tender object and a requirements array.",
      loadError: "Could not load requirements: ",
      pdfOnly: "Only PDF files are accepted: ",
      fileLimit: "The limit is 30 PDF files. This selection was not added.",
      sizeLimit: "The total PDF size cannot exceed 50 MB. This selection was not added.",
      ready: "All required documents are valid. The package is ready to generate.",
      resolve: "Resolve the blocking issues shown above before generating.",
      loadFirst: "Load a valid requirements.json file to begin.",
      generating: "Building your PDF package…",
      generateError: "Could not generate the package: ",
      generated: "Your package PDF has been downloaded.",
      noRequirements: "No documents are defined in this requirements file.",
      packageDate: "Package date",
      included: "Included documents",
      footer: "Page",
      statusLoad: "Load requirements and PDFs to see validation results."
    },
    bn: {
      eyebrow: "দরপত্র নথি কর্মক্ষেত্র",
      appTitle: "দরপত্র প্যাকেজ যাচাইকারী",
      appSubtitle: "সম্পূর্ণ দরপত্র প্যাকেজ প্রস্তুত, যাচাই ও তৈরি করুন।",
      tenderInfo: "দরপত্রের তথ্য",
      loadRequirements: "দরপত্রের প্রয়োজনীয়তা লোড করুন",
      loadHelp: "এই দরপত্রের requirements.json ফাইল নির্বাচন করুন।",
      chooseJson: "requirements.json নির্বাচন করুন",
      requiredDocs: "প্রয়োজনীয় নথি",
      requirementsEmpty: "নথির তালিকা দেখতে requirements.json লোড করুন।",
      document: "নথি",
      requirement: "প্রয়োজনীয়তা",
      expiry: "মেয়াদ",
      matchedFile: "মেলানো ফাইল",
      status: "অবস্থা",
      uploadedDocs: "আপলোড করা নথি",
      uploadPdfs: "PDF ফাইল আপলোড করুন",
      uploadHelp: "দরপত্রের প্রয়োজনীয়তার সঙ্গে মেলাতে নথি যোগ করুন।",
      choosePdfs: "PDF ফাইল নির্বাচন করুন",
      limits: "শুধু PDF · সর্বোচ্চ ৩০টি ফাইল · মোট ৫০ MB",
      files: "ফাইল",
      validationSummary: "যাচাইয়ের সারাংশ",
      valid: "ঠিক আছে",
      notProvided: "দেওয়া হয়নি",
      blockingIssues: "সমাধান প্রয়োজন",
      generate: "প্যাকেজ PDF তৈরি করুন",
      generateHelp: "তৈরি করতে প্রয়োজনীয়তা লোড করে সব সমস্যা সমাধান করুন।",
      privacyNote: "ফাইলগুলো আপনার ব্রাউজারেই প্রক্রিয়া করা হয়, আপলোড করা হয় না।",
      tenderId: "দরপত্র আইডি",
      tenderTitle: "দরপত্রের শিরোনাম",
      entity: "ক্রয়কারী প্রতিষ্ঠান",
      bidder: "দরদাতা",
      deadline: "জমাদানের শেষ সময়",
      required: "আবশ্যক",
      optional: "ঐচ্ছিক",
      notRequired: "প্রযোজ্য নয়",
      selectPdf: "PDF নির্বাচন করুন",
      expiryNeeded: "মেয়াদ শেষের তারিখ প্রয়োজন",
      expired: "মেয়াদোত্তীর্ণ",
      missing: "অনুপস্থিত",
      ok: "ঠিক আছে",
      matched: "মেলানো হয়েছে",
      page: "পৃষ্ঠা",
      pages: "পৃষ্ঠা",
      remove: "সরান",
      duplicate: "একই বিষয়বস্তুর ফাইল",
      badPdf: "PDF পড়া যায়নি। বৈধ, পাসওয়ার্ডবিহীন PDF নির্বাচন করুন।",
      invalidJson: "requirements ফাইলটি সঠিক নয়। এতে tender object এবং requirements তালিকা থাকতে হবে।",
      loadError: "প্রয়োজনীয়তা লোড করা যায়নি: ",
      pdfOnly: "শুধু PDF ফাইল গ্রহণ করা হয়: ",
      fileLimit: "সর্বোচ্চ ৩০টি PDF ফাইল দেওয়া যাবে। এই নির্বাচন যোগ করা হয়নি।",
      sizeLimit: "সব PDF মিলিয়ে ৫০ MB-এর বেশি হতে পারবে না। এই নির্বাচন যোগ করা হয়নি।",
      ready: "সব আবশ্যক নথি ঠিক আছে। প্যাকেজ তৈরির জন্য প্রস্তুত।",
      resolve: "তৈরির আগে দেখানো সমস্যাগুলো সমাধান করুন।",
      loadFirst: "শুরু করতে সঠিক requirements.json ফাইল লোড করুন।",
      generating: "PDF প্যাকেজ তৈরি হচ্ছে…",
      generateError: "প্যাকেজ তৈরি করা যায়নি: ",
      generated: "আপনার প্যাকেজ PDF ডাউনলোড হয়েছে।",
      noRequirements: "এই ফাইলে কোনো নথি নির্ধারিত নেই।",
      packageDate: "প্যাকেজের তারিখ",
      included: "অন্তর্ভুক্ত নথি",
      footer: "পৃষ্ঠা",
      statusLoad: "যাচাই দেখতে requirements ও PDF লোড করুন।"
    }
  };

  const tr = (key) => text[state.language][key] || text.en[key] || key;

  const safe = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[character]));

  const requiredIds = [
    "requirements-file",
    "pdf-files",
    "requirements-error",
    "tender-details",
    "requirements-empty",
    "requirements-table-wrapper",
    "requirements-list",
    "uploaded-list-container",
    "uploaded-files",
    "file-count",
    "upload-message",
    "valid-count",
    "optional-count",
    "problem-count",
    "requirements-count",
    "validation-message",
    "generate-button",
    "generate-help"
  ];

  const missingIds = requiredIds.filter((id) => !$(id));

  if (missingIds.length) {
    const message =
      `This page's HTML and script.js do not match. Missing page elements: ${missingIds.join(", ")}. Replace the three files with the same release, then reload.`;

    if (document.body) {
      document.body.innerHTML =
        `<main style="max-width:720px;margin:48px auto;padding:24px;font:16px/1.5 system-ui"><h1>Page files do not match</h1><p>${safe(message)}</p></main>`;
    } else {
      window.alert(message);
    }

    console.error(message);
    return;
  }

  const formatSize = (bytes) =>
    bytes < 1024 * 1024
      ? `${Math.ceil(bytes / 1024)} KB`
      : `${(bytes / 1048576).toFixed(1)} MB`;

  const dateOnly = (value) => {
    if (!value) return null;
    const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);
    if (!match) return null;

    const date = new Date(`${match[0]}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const localToday = () => {
    const date = new Date();
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  };

  document.querySelectorAll(".language-btn").forEach((button) => {
    button.addEventListener("click", () => {
      state.language = button.dataset.language;
      document.documentElement.lang = state.language;

      document.querySelectorAll(".language-btn").forEach((item) => {
        item.classList.toggle("active", item === button);
      });

      document.querySelectorAll("[data-i18n]").forEach((node) => {
        const key = node.dataset.i18n;
        if (text[state.language][key]) node.textContent = tr(key);
      });

      renderAll();
    });
  });

  $("requirements-file").addEventListener("change", loadRequirements);
  $("pdf-files").addEventListener("change", addPdfs);
  $("generate-button").addEventListener("click", generatePackage);

  async function loadRequirements(event) {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;

    try {
      const data = JSON.parse(await file.text());

      if (
        !data ||
        !data.tender ||
        typeof data.tender !== "object" ||
        Array.isArray(data.tender) ||
        !Array.isArray(data.requirements)
      ) {
        throw new Error(tr("invalidJson"));
      }

      const ids = new Set();
      const requirements = data.requirements
        .map((requirement, index) => {
          if (
            !requirement ||
            requirement.id == null ||
            ids.has(String(requirement.id))
          ) {
            throw new Error(tr("invalidJson"));
          }

          ids.add(String(requirement.id));

          return {
            ...requirement,
            id: String(requirement.id),
            order: Number(requirement.order ?? index + 1)
          };
        })
        .sort((a, b) => a.order - b.order);

      state.tender = data.tender;
      state.requirements = requirements;
      state.matches.clear();
      state.expiryDates.clear();

      $("requirements-error").classList.add("hidden");
      renderAll();
    } catch (error) {
      showNotice("requirements-error", `${tr("loadError")}${error.message}`, true);
    }
  }

  function renderTender() {
    const box = $("tender-details");

    if (!state.tender) {
      box.classList.add("hidden");
      return;
    }

    const tender = state.tender;
    const entries = [
      ["tenderId", tender.tender_id],
      ["tenderTitle", tender.title_en || tender.title],
      ["entity", tender.procuring_entity],
      ["bidder", tender.bidder],
      ["deadline", tender.submission_deadline]
    ];

    box.innerHTML = entries
      .map(([label, value]) =>
        `<div class="detail-item"><dt>${safe(tr(label))}</dt><dd>${safe(value || "—")}</dd></div>`
      )
      .join("");

    box.classList.remove("hidden");
  }

  function fileForRequirement(requirementId) {
    const fileId = state.matches.get(requirementId);
    return state.files.find((file) => file.id === fileId) || null;
  }

  function requirementForFile(fileId) {
    for (const [requirementId, currentFileId] of state.matches) {
      if (currentFileId === fileId) return requirementId;
    }

    return null;
  }

  function isDuplicate(file) {
    return state.files.find((other) => other.hash === file.hash)?.id !== file.id;
  }

  function statusOf(requirement) {
    const file = fileForRequirement(requirement.id);

    if (!file) {
      return requirement.mandatory === false
        ? { label: tr("notProvided"), kind: "warning", blocking: false }
        : { label: tr("missing"), kind: "error", blocking: true };
    }

    if (requirement.has_expiry) {
      const value = state.expiryDates.get(requirement.id);

      if (!value) {
        return { label: tr("expiryNeeded"), kind: "error", blocking: true };
      }

      const expiry = dateOnly(value);
      const deadline = dateOnly(state.tender?.submission_deadline);

      if (!expiry) {
        return { label: tr("expiryNeeded"), kind: "error", blocking: true };
      }

      // An expiry date equal to the submission deadline is valid.
      if (expiry < localToday() || (deadline && expiry < deadline)) {
        return { label: tr("expired"), kind: "error", blocking: true };
      }
    }

    return { label: tr("ok"), kind: "ok", blocking: false };
  }

  function renderRequirements() {
    const list = $("requirements-list");

    if (!state.requirements.length) {
      $("requirements-empty").textContent = state.tender
        ? tr("noRequirements")
        : tr("requirementsEmpty");

      $("requirements-empty").classList.remove("hidden");
      $("requirements-table-wrapper").classList.add("hidden");
      return;
    }

    $("requirements-empty").classList.add("hidden");
    $("requirements-table-wrapper").classList.remove("hidden");
    list.replaceChildren();

    state.requirements.forEach((requirement) => {
      const row = document.createElement("tr");
      const matched = fileForRequirement(requirement.id);
      const status = statusOf(requirement);
      const name = state.language === "bn"
        ? requirement.title_bn
        : requirement.title_en;

      const choices = state.files.filter((file) =>
        !isDuplicate(file) &&
        (!requirementForFile(file.id) ||
          requirementForFile(file.id) === requirement.id)
      );

      const options = [
        `<option value="">${safe(tr("selectPdf"))}</option>`,
        ...choices.map((file) =>
          `<option value="${safe(file.id)}" ${matched?.id === file.id ? "selected" : ""}>${safe(file.name)}</option>`
        )
      ].join("");

      const expiryCell = requirement.has_expiry && matched
        ? `<input class="expiry-input" type="date" aria-label="${safe(tr("expiry"))}" value="${safe(state.expiryDates.get(requirement.id) || "")}">`
        : `<span class="muted">${safe(requirement.has_expiry ? tr("required") : tr("notRequired"))}</span>`;

      row.innerHTML = `
        <td>${safe(requirement.order)}</td>
        <td>${safe(name || requirement.title_en || requirement.id)}</td>
        <td><span class="requirement-type">${requirement.mandatory === false ? safe(tr("optional")) : safe(tr("required"))}</span></td>
        <td></td>
        <td><select class="match-select" aria-label="${safe(tr("matchedFile"))}">${options}</select></td>
        <td><span class="status-badge status-${status.kind}">${safe(status.label)}</span></td>
      `;

      row.cells[3].innerHTML = expiryCell;
      list.appendChild(row);

      row.querySelector(".match-select").addEventListener("change", (event) => {
        const fileId = event.target.value;

        if (fileId) {
          const oldRequirement = requirementForFile(fileId);

          if (oldRequirement && oldRequirement !== requirement.id) {
            state.matches.delete(oldRequirement);
          }

          if (state.matches.get(requirement.id) !== fileId) {
            state.expiryDates.delete(requirement.id);
          }

          state.matches.set(requirement.id, fileId);
        } else {
          state.matches.delete(requirement.id);
          state.expiryDates.delete(requirement.id);
        }

        renderAll();
      });

      row.querySelector(".expiry-input")?.addEventListener("change", (event) => {
        state.expiryDates.set(requirement.id, event.target.value);
        renderAll();
      });
    });
  }

  async function addPdfs(event) {
    const selected = Array.from(event.target.files);
    event.target.value = "";
    if (!selected.length) return;

    if (!window.pdfjsLib) {
      return showNotice(
        "upload-message",
        "PDF page-count library did not load. Check your internet connection and reload the page.",
        true
      );
    }

    const nonPdf = selected.find((file) =>
      !file.name.toLowerCase().endsWith(".pdf") &&
      file.type !== "application/pdf"
    );

    if (nonPdf) {
      return showNotice("upload-message", `${tr("pdfOnly")}${nonPdf.name}`, true);
    }

    if (state.files.length + selected.length > MAX_FILES) {
      return showNotice("upload-message", tr("fileLimit"), true);
    }

    const currentBytes = state.files.reduce((sum, file) => sum + file.size, 0);
    const selectedBytes = selected.reduce((sum, file) => sum + file.size, 0);

    if (currentBytes + selectedBytes > MAX_BYTES) {
      return showNotice("upload-message", tr("sizeLimit"), true);
    }

    showNotice("upload-message", "", false);

    for (const file of selected) {
      try {
        const buffer = await file.arrayBuffer();
        const hash = await digest(buffer);
        const pdf = await window.pdfjsLib.getDocument({
          data: new Uint8Array(buffer.slice(0))
        }).promise;

        state.files.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          hash,
          pages: pdf.numPages,
          buffer
        });
      } catch {
        showNotice("upload-message", `${tr("badPdf")} ${file.name}`, true);
      }
    }

    renderAll();
  }

  async function digest(buffer) {
    const bytes = await crypto.subtle.digest("SHA-256", buffer);

    return Array.from(
      new Uint8Array(bytes),
      (byte) => byte.toString(16).padStart(2, "0")
    ).join("");
  }

  function renderFiles() {
    const list = $("uploaded-files");
    list.replaceChildren();

    const total = state.files.reduce((sum, file) => sum + file.size, 0);

    $("file-count").textContent =
      `${state.files.length} ${state.files.length === 1 ? "file" : "files"} · ${formatSize(total)}`;

    $("uploaded-list-container").classList.toggle(
      "hidden",
      state.files.length === 0
    );

    state.files.forEach((file) => {
      const row = document.createElement("div");
      row.className = "file-row";

      const duplicate = isDuplicate(file);

      row.innerHTML = `
        <div class="file-info">
          <span class="file-name">${safe(file.name)}</span>
          <span class="file-meta">${formatSize(file.size)} · ${file.pages} ${safe(file.pages === 1 ? tr("page") : tr("pages"))}</span>
          ${duplicate ? `<span class="file-warning">${safe(tr("duplicate"))}</span>` : ""}
        </div>
        <button type="button" class="button button-secondary">${safe(tr("remove"))}</button>
      `;

      row.querySelector("button").addEventListener("click", () => {
        for (const [requirementId, fileId] of state.matches) {
          if (fileId === file.id) {
            state.matches.delete(requirementId);
            state.expiryDates.delete(requirementId);
          }
        }

        state.files = state.files.filter((item) => item.id !== file.id);
        renderAll();
      });

      list.appendChild(row);
    });
  }

  function updateValidation() {
    const statuses = state.requirements.map(statusOf);
    const valid = statuses.filter((status) => status.kind === "ok").length;
    const optional = statuses.filter((status) => status.kind === "warning").length;
    const problems = statuses.filter((status) => status.blocking).length;

    $("valid-count").textContent = valid;
    $("optional-count").textContent = optional;
    $("problem-count").textContent = problems;
    $("requirements-count").textContent =
      `${valid} / ${state.requirements.length} ${tr("ok")}`;

    const ready = Boolean(
      state.tender && state.requirements.length && problems === 0
    );

    $("generate-button").disabled = !ready;
    $("validation-message").textContent = !state.tender
      ? tr("loadFirst")
      : ready
        ? tr("ready")
        : tr("resolve");

    $("generate-help").textContent = ready ? tr("ready") : tr("generateHelp");
  }

  function renderAll() {
    renderTender();
    renderRequirements();
    renderFiles();
    updateValidation();
  }

  function showNotice(id, message, error) {
    const element = $(id);

    if (element) {
      element.textContent = message;
      element.classList.toggle("hidden", !message);
      element.classList.toggle("error", Boolean(error));
      return;
    }

    // A stale or mismatched HTML file may not contain this notice element.
    const fallback = $("validation-message");

    if (fallback) {
      fallback.textContent = message;
    } else if (message) {
      window.alert(message);
    }

    console.error(`Missing expected page element #${id}.`, message);
  }

  async function generatePackage() {
    if ($("generate-button").disabled) return;

    if (!window.PDFLib) {
      $("validation-message").textContent =
        "PDF generation library did not load. Check your internet connection and reload the page.";
      return;
    }

    $("generate-button").disabled = true;
    $("validation-message").textContent = tr("generating");

    try {
      const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
      const output = await PDFDocument.create();
      const font = await output.embedFont(StandardFonts.Helvetica);
      const bold = await output.embedFont(StandardFonts.HelveticaBold);
      const pageSize = [612, 792];
      const margin = 48;

      const draw = (
        page,
        value,
        x,
        y,
        size = 11,
        face = font,
        color = rgb(.12, .16, .23)
      ) => {
        page.drawText(String(value ?? "—"), {
          x,
          y,
          size,
          font: face,
          color,
          maxWidth: pageSize[0] - margin - x
        });
      };

      let cover = output.addPage(pageSize);

      draw(
        cover,
        "TENDER DOCUMENT PACKAGE",
        margin,
        720,
        19,
        bold,
        rgb(.12, .29, .62)
      );

      // The cover page is always English, regardless of the selected UI language.
      draw(cover, `Tender ID: ${state.tender.tender_id || "—"}`, margin, 674, 12, bold);
      draw(cover, `Tender title: ${state.tender.title_en || state.tender.title || "—"}`, margin, 649, 12);
      draw(cover, `Procuring entity: ${state.tender.procuring_entity || "—"}`, margin, 624, 12);
      draw(cover, `Bidder: ${state.tender.bidder || "—"}`, margin, 599, 12);
      draw(cover, `Submission deadline: ${state.tender.submission_deadline || "—"}`, margin, 574, 12);

      const today = new Date();
      const packageDate =
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      draw(cover, `Package date: ${packageDate}`, margin, 549, 12);
      draw(cover, "Included documents", margin, 500, 13, bold);

      let y = 475;

      for (const requirement of state.requirements) {
        const file = fileForRequirement(requirement.id);
        if (!file) continue;

        const name = requirement.title_en || requirement.id;

        if (y < 55) {
          cover = output.addPage(pageSize);
          draw(cover, "Included documents (continued)", margin, 730, 13, bold);
          y = 700;
        }

        draw(
          cover,
          `${requirement.order}. ${name} — ${file.name}`,
          margin + 10,
          y,
          10
        );

        y -= 20;
      }

      const ordered = state.requirements
        .map((requirement) => ({
          requirement,
          file: fileForRequirement(requirement.id)
        }))
        .filter((item) => item.file);

      for (const { file } of ordered) {
        const source = await PDFDocument.load(file.buffer.slice(0));
        const pages = await output.copyPages(source, source.getPageIndices());
        pages.forEach((page) => output.addPage(page));
      }

      const pages = output.getPages();
      const total = pages.length;
      const tenderId = String(state.tender.tender_id || "Tender");

      pages.forEach((page, index) => {
        const { width } = page.getSize();

        page.drawText(`${tenderId} | Page ${index + 1} of ${total}`, {
          x: 36,
          y: 14,
          size: 8,
          font,
          color: rgb(.35, .38, .43),
          maxWidth: width - 72
        });
      });

      const bytes = await output.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download =
        `${tenderId.replace(/[\\/:*?"<>|]/g, "_")}_Package.pdf`;
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
      $("validation-message").textContent = tr("generated");
    } catch (error) {
      $("validation-message").textContent =
        `${tr("generateError")}${error.message}`;
    } finally {
      updateValidation();
    }
  }

  renderAll();
})();