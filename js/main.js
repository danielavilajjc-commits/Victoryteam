(() => {
  "use strict";

  const STORAGE = {
    progress: "core1-progress",
    reflection: "core1-reflection"
  };

  const safeRead = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error(`No fue posible leer el almacenamiento local (${key}).`, error);
      return fallback;
    }
  };

  const safeWrite = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`No fue posible guardar en el almacenamiento local (${key}).`, error);
      return false;
    }
  };

  window.Core1 = Object.freeze({
    storageKeys: STORAGE,
    read: safeRead,
    write: safeWrite,
    getProgress() {
      const value = safeRead(STORAGE.progress, {});
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    },
    updateProgress(changes) {
      const progress = { ...this.getProgress(), ...changes };
      return safeWrite(STORAGE.progress, progress) ? progress : null;
    },
    toast(message, duration = 3600) {
      if (!message) return;
      let region = document.querySelector(".toast-region");
      if (!region) {
        region = document.createElement("div");
        region.className = "toast-region";
        region.setAttribute("aria-live", "polite");
        region.setAttribute("aria-atomic", "false");
        document.body.append(region);
      }
      const toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.textContent = message;
      region.append(toast);
      window.setTimeout(() => {
        toast.remove();
        if (!region.childElementCount) region.remove();
      }, duration);
    }
  });

  const nav = document.querySelector(".primary-nav");
  const toggle = document.querySelector(".menu-toggle");
  const pageName = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".primary-nav a").forEach((link) => {
    const target = link.getAttribute("href");
    if (target === pageName || (pageName === "" && target === "index.html")) {
      link.setAttribute("aria-current", "page");
    }
  });

  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
      nav.classList.toggle("is-open", !isOpen);
    });

    nav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menú");
      }
    });
  }

  document.addEventListener("click", (event) => {
    const anchor = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
    if (!anchor) return;
    const destination = document.querySelector(anchor.getAttribute("href"));
    if (destination) {
      destination.classList.remove("arrival-highlight");
      requestAnimationFrame(() => destination.classList.add("arrival-highlight"));
      window.setTimeout(() => destination.classList.remove("arrival-highlight"), 1100);
    }
  });

  const reflectionForm = document.querySelector("#commitment-form");
  if (reflectionForm) {
    const fields = Array.from(reflectionForm.querySelectorAll("textarea"));
    const status = document.querySelector("#save-status");
    const output = document.querySelector("#saved-commitment");
    const existing = safeRead(STORAGE.reflection, {});
    fields.forEach((field) => {
      if (typeof existing[field.name] === "string") field.value = existing[field.name];
    });
    renderSavedCommitment(existing, output);

    reflectionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const commitment = Object.fromEntries(fields.map((field) => [field.name, field.value.trim()]));
      const hasText = Object.values(commitment).some(Boolean);
      if (!hasText) {
        if (status) status.textContent = "Escribe al menos una frase antes de guardar.";
        fields[0]?.focus();
        return;
      }
      const saved = safeWrite(STORAGE.reflection, commitment);
      if (status) status.textContent = saved ? "Tu compromiso quedó guardado en este dispositivo." : "No se pudo guardar. Revisa la configuración de almacenamiento del navegador.";
      if (saved) {
        renderSavedCommitment(commitment, output);
        window.Core1.toast("Tu reflexión quedó en tu caja de compromisos.");
      }
    });
  }

  function renderSavedCommitment(commitment, output) {
    if (!output) return;
    const labels = {
      discovery: "Hoy descubrí que soy...",
      selfWorth: "Algo que valoro de mí...",
      influence: "Una influencia que quiero manejar...",
      decision: "Una decisión por mí mismo/a...",
      happiness: "Para construir mi felicidad..."
    };
    const entries = Object.entries(labels).filter(([key]) => typeof commitment[key] === "string" && commitment[key].trim());
    if (!entries.length) {
      output.replaceChildren();
      const message = document.createElement("p");
      message.textContent = "Todavía no has guardado un compromiso. Cuando estés listo/a, tus palabras aparecerán aquí.";
      output.append(message);
      return;
    }
    const list = document.createElement("dl");
    entries.forEach(([key, label]) => {
      const term = document.createElement("dt");
      term.textContent = label;
      const detail = document.createElement("dd");
      detail.textContent = commitment[key];
      list.append(term, detail);
    });
    output.replaceChildren(list);
  }

  const puzzle = document.querySelector("#identity-puzzle");
  if (puzzle) {
    const topics = [
      ["01", "Persona"], ["02", "Libertad"], ["03", "Identidad"], ["04", "Autoestima"],
      ["05", "Personalidad"], ["06", "Familia"], ["07", "Amistad"], ["08", "Redes"]
    ];
    const message = document.querySelector("#puzzle-message");
    const reveal = document.querySelector("#puzzle-reveal");
    const saved = safeRead("core1-puzzle", []);
    const selected = new Set(Array.isArray(saved) ? saved.filter((item) => Number.isInteger(item) && item >= 0 && item < topics.length) : []);
    topics.forEach(([number, topic], index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "puzzle-piece";
      button.setAttribute("aria-pressed", String(selected.has(index)));
      button.innerHTML = `<span>PIEZA ${number}</span>${topic}`;
      if (selected.has(index)) button.classList.add("is-revealed");
      button.addEventListener("click", () => {
        if (selected.has(index)) {
          selected.delete(index);
          button.classList.remove("is-revealed");
        } else {
          selected.add(index);
          button.classList.add("is-revealed");
        }
        button.setAttribute("aria-pressed", String(selected.has(index)));
        const values = Array.from(selected).sort((a, b) => a - b);
        if (!safeWrite("core1-puzzle", values)) window.Core1.toast("No se pudo guardar el rompecabezas. Revisa el almacenamiento de este navegador.");
        if (message) message.textContent = `${values.length} de ${topics.length} piezas reunidas.`;
        if (reveal) reveal.hidden = values.length !== topics.length;
        if (values.length === topics.length) window.Core1.toast("Las ocho miradas se reúnen en una historia: la tuya.");
      });
      puzzle.append(button);
    });
    if (message && selected.size) message.textContent = `${selected.size} de ${topics.length} piezas reunidas.`;
    if (reveal) reveal.hidden = selected.size !== topics.length;
  }

  const glossaryList = document.querySelector("#glossary-list");
  if (glossaryList) initializeGlossary(glossaryList);

  function initializeGlossary(container) {
    const terms = [
      { title: "Persona", text: "Un ser singular e integral: piensa, siente, actúa, se relaciona y puede proyectarse. Sus dimensiones se influyen mutuamente; ninguna agota por sí sola quién es.", question: "¿Qué dimensión de tu vida pide hoy más cuidado?" },
      { title: "Libertad y responsabilidad", text: "La libertad no consiste en hacer cualquier cosa sin considerar a los demás. Es la posibilidad de elegir entre alternativas y responder por las consecuencias, incluso cuando hay presiones.", question: "¿Qué valor quieres que oriente una decisión difícil?" },
      { title: "Identidad", text: "La comprensión cambiante de quién eres, formada por valores, creencias, cultura, vínculos, experiencias y proyectos. No es una etiqueta fija: también se construye con tus elecciones.", question: "¿Qué parte de tu historia eliges conservar o transformar?" },
      { title: "Autoestima", text: "La valoración y el trato que te das como persona digna, más allá de un resultado, una apariencia o la aprobación externa. Reconocer límites puede convivir con reconocer capacidades.", question: "¿Qué logro pequeño merece ser reconocido por ti?" },
      { title: "Personalidad", text: "Un conjunto de tendencias y maneras de relacionarte con el mundo. Los rasgos no son casillas inmutables: pueden expresarse de formas distintas según el contexto y la experiencia.", question: "¿En qué situaciones aparece una faceta tuya que aprecias?" },
      { title: "Familia y autonomía", text: "Los vínculos y experiencias familiares pueden transmitir valores y referentes; reconocer su influencia no elimina la capacidad de construir un proyecto propio y establecer límites.", question: "¿Qué aprendizaje de tus raíces quieres llevar a tu futuro?" },
      { title: "Amistad saludable", text: "Un vínculo que permite confianza, reciprocidad, respeto, diferencias y límites. La presión, el miedo constante o la manipulación son señales para detenerse, buscar apoyo y cuidar la seguridad.", question: "¿Puedes decir que no y seguir sintiéndote respetado/a?" },
      { title: "Identidad digital y comparación", text: "Un perfil muestra una selección parcial de la vida, no a la persona completa. Comparar tu experiencia cotidiana con vitrinas editadas puede distorsionar la percepción de ti y de los demás.", question: "¿Qué no puedes conocer de alguien a partir de una publicación?" }
    ];
    terms.forEach((term, index) => {
      const details = document.createElement("details");
      details.className = "glossary-item";
      details.dataset.search = `${term.title} ${term.text} ${term.question}`.toLocaleLowerCase("es");
      const summary = document.createElement("summary");
      const number = document.createElement("span");
      number.className = "glossary-number";
      number.textContent = String(index + 1).padStart(2, "0");
      const title = document.createElement("span");
      title.className = "glossary-term";
      title.textContent = term.title;
      summary.append(number, title);
      const body = document.createElement("div");
      body.className = "glossary-body";
      const definition = document.createElement("p");
      definition.textContent = term.text;
      const question = document.createElement("p");
      question.className = "glossary-question";
      question.textContent = `Para pensar: ${term.question}`;
      body.append(definition, question);
      details.append(summary, body);
      container.append(details);
    });

    const search = document.querySelector("#glossary-search");
    const count = document.querySelector("#search-count");
    const empty = document.querySelector("#no-results");
    search?.addEventListener("input", () => {
      const query = search.value.trim().toLocaleLowerCase("es");
      let visible = 0;
      container.querySelectorAll(".glossary-item").forEach((item) => {
        const matches = item.dataset.search.includes(query);
        item.hidden = !matches;
        if (matches) visible += 1;
      });
      if (count) count.textContent = `${visible} ${visible === 1 ? "concepto" : "conceptos"}`;
      if (empty) empty.hidden = visible !== 0;
    });

    document.querySelector("#download-summary")?.addEventListener("click", downloadSummary);
  }

  function downloadSummary() {
    const terms = Array.from(document.querySelectorAll(".glossary-item")).map((item) => {
      const title = item.querySelector(".glossary-term")?.textContent || "";
      const paragraphs = Array.from(item.querySelectorAll(".glossary-body p")).map((p) => p.textContent);
      return `${title}\n${paragraphs.join("\n")}`;
    });
    const reflection = safeRead(STORAGE.reflection, {});
    const reflectionLabels = {
      discovery: "Hoy descubrí que soy",
      selfWorth: "Algo que valoro de mí",
      influence: "Una influencia que quiero manejar",
      decision: "Una decisión que quiero tomar por mí mismo/a",
      happiness: "Para construir mi felicidad necesito"
    };
    const personalNotes = Object.entries(reflectionLabels)
      .filter(([key]) => typeof reflection[key] === "string" && reflection[key].trim())
      .map(([key, label]) => `${label}:\n${reflection[key]}`);
    const content = [
      "CORE 1 — PERSONA Y AUTOCONOCIMIENTO",
      "Mi bitácora personal",
      `Fecha: ${new Date().toLocaleDateString("es-CO")}`,
      "",
      "OCHO CONCEPTOS PARA RECORDAR",
      ...terms.flatMap((term) => [term, ""]),
      "MIS REFLEXIONES",
      ...(personalNotes.length ? personalNotes : ["Aún no has guardado respuestas en tu caja de compromisos."])
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bitacora-core-1.txt";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    window.Core1.toast("Tu bitácora se descargó como archivo de texto.");
  }
})();
