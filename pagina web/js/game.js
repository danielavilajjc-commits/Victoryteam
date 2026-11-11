(() => {
  "use strict";

  const stations = [
    { title: "Soy único", category: "Persona", subtitle: "Dimensiones humanas", intro: "Una persona no es solo lo que piensa o hace. Conecta cada dimensión con una forma en que puede expresarse.", type: "matching" },
    { title: "El poder de elegir", category: "Libertad y felicidad", subtitle: "Decisiones con sentido", intro: "La presión puede sentirse fuerte. Lee la situación y elige una respuesta que te permita actuar con conciencia y cuidar tus límites.", type: "choice" },
    { title: "Construyendo quién soy", category: "Identidad", subtitle: "Pilares personales", intro: "La identidad reúne muchas influencias y decisiones. Elige cinco elementos que hoy sientas importantes en tu historia.", type: "identity" },
    { title: "Mi valor no se negocia", category: "Autoestima", subtitle: "Reconocer lo propio", intro: "Una mirada amable incluye lo que haces bien y el esfuerzo que hay detrás. Registra fortalezas y logros cotidianos, sin compararte.", type: "wall" },
    { title: "Descubre tu esencia", category: "Personalidad", subtitle: "Diferentes maneras de ser", intro: "No hay un único modo correcto de relacionarse. Empareja cada rasgo con una descripción posible, no con una etiqueta definitiva.", type: "matching" },
    { title: "Mis raíces, mi historia", category: "Familia", subtitle: "Raíces, tronco y ramas", intro: "Puedes reconocer lo que recibiste, nombrar lo vivido y proyectar un camino propio. Completa cada parte del árbol con tus palabras.", type: "family" },
    { title: "¿Amigos o influencias?", category: "Amistad", subtitle: "El semáforo de los vínculos", intro: "Clasifica cada situación según cómo la leerías. Si te sientes en riesgo o bajo presión, prioriza tu seguridad y busca apoyo de alguien confiable.", type: "traffic" },
    { title: "La vida detrás de la pantalla", category: "Redes sociales", subtitle: "Vitrina y realidad", intro: "Una publicación es una selección, no la historia completa. Decide si cada afirmación es un hecho fiable o un mito sobre las redes.", type: "media" }
  ];

  const matchingSets = {
    0: {
      leftTitle: "Dimensiones",
      rightTitle: "Pueden expresarse en...",
      left: [["thoughts", "Cabeza · pensamientos"], ["feelings", "Corazón · emociones"], ["skills", "Manos · habilidades"], ["goals", "Pies · metas"]],
      right: [["skills", "Resolver un problema con paciencia"], ["goals", "Avanzar hacia algo que deseas"], ["thoughts", "Preguntarte por qué ocurre algo"], ["feelings", "Reconocer alegría, miedo o tristeza"]],
      feedback: "Las dimensiones se relacionan: pensar, sentir, actuar y proyectarse forman parte de una misma persona."
    },
    4: {
      leftTitle: "Rasgos",
      rightTitle: "Una forma posible de expresarlos",
      left: [["creative", "Creativo/a"], ["persistent", "Perseverante"], ["reserved", "Reservado/a"], ["responsible", "Responsable"], ["sociable", "Sociable"], ["spontaneous", "Espontáneo/a"]],
      right: [["sociable", "Disfruta iniciar conversaciones y compartir con otros"], ["creative", "Explora ideas nuevas y encuentra caminos diferentes"], ["responsible", "Procura cumplir acuerdos y cuidar sus compromisos"], ["spontaneous", "Puede adaptarse al momento e improvisar"], ["persistent", "Continúa intentando, incluso cuando algo cuesta"], ["reserved", "Prefiere observar o compartir en confianza"]],
      feedback: "Un rasgo no es una etiqueta rígida. Cada persona expresa una combinación propia que puede cambiar con el contexto."
    }
  };

  const challenges = {
    1: {
      title: "El grupo quiere que compartas una foto privada de alguien. Dicen que, si no lo haces, eres aburrido/a.",
      options: [
        { label: "La comparto para que no se molesten conmigo.", feedback: "La pertenencia importa, pero no exige cruzar un límite. Compartir algo privado puede dañar a otra persona y no se puede deshacer con facilidad." },
        { label: "Me detengo, digo que no y propongo no difundirla.", feedback: "Poner un límite cuida a la otra persona y expresa una decisión propia. Si hay presión, pedir apoyo también es una opción responsable." },
        { label: "Pregunto a la persona involucrada si quiere que la envíe.", feedback: "Buscar consentimiento es importante; aun así, ante presión grupal o contenido privado, lo más cuidadoso es no difundir y proteger la intimidad." }
      ]
    },
    6: {
      title: "Una amistad te pide que canceles tus otros planes. Si no aceptas, te dice que dejará de hablarte.",
      items: [
        { id: "friend-1", text: "Te escucha, respeta un «no» y ambos pueden proponer planes." },
        { id: "friend-2", text: "A veces te hace sentir culpable; no sabes si fue una broma o si puedes hablarlo." },
        { id: "friend-3", text: "Te amenaza con divulgar algo privado para obligarte a obedecer." }
      ]
    },
    7: [
      { myth: "«Si alguien publica una vida perfecta, seguramente nunca tiene problemas.»", answer: "myth", explanation: "Una publicación muestra una selección editada. No permite conocer por completo la vida emocional o las dificultades de alguien.", prompt: "¿Hecho o mito?" },
      { myth: "«Puedo tomar una pausa de redes si noto que me hacen sentir mal.»", answer: "fact", explanation: "Ajustar el tiempo, las cuentas que sigues o las notificaciones puede ayudarte a cuidar tu bienestar.", prompt: "¿Hecho o mito?" },
      { myth: "«La cantidad de seguidores demuestra cuánto vale una persona.»", answer: "myth", explanation: "La dignidad y el valor de una persona no dependen de métricas, reacciones ni popularidad digital.", prompt: "¿Hecho o mito?" }
    ]
  };

  const identityOptions = ["Valores", "Creencias", "Cultura", "Sueños", "Experiencias", "Vínculos", "Gustos", "Decisiones"];
  const state = window.Core1.getProgress();
  state.completed = Array.isArray(state.completed) ? state.completed : [];
  state.scores = state.scores && typeof state.scores === "object" ? state.scores : {};
  state.activities = state.activities && typeof state.activities === "object" ? state.activities : {};
  let activeIndex = 0;
  const stationList = document.querySelector("#station-list");
  const panel = document.querySelector("#challenge-panel");

  if (!stationList || !panel) return;

  function save() {
    const saved = window.Core1.updateProgress(state);
    if (!saved) window.Core1.toast("No se pudo guardar el progreso. Revisa el almacenamiento de este navegador.");
    updateSummary();
  }

  function activity(index) {
    if (!state.activities[index]) state.activities[index] = {};
    return state.activities[index];
  }

  function markComplete(index, points, message) {
    const alreadyComplete = state.completed.includes(index);
    if (!alreadyComplete) {
      state.completed.push(index);
      state.scores[index] = points;
      window.Core1.toast(message);
      save();
    }
    renderStationList();
    updateSummary();
    const note = panel.querySelector(".complete-note");
    if (note) note.textContent = alreadyComplete ? "Estación completada. Puedes volver a explorarla cuando quieras." : message;
  }

  function renderStationList() {
    stationList.replaceChildren();
    stations.forEach((station, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "station-link";
      if (state.completed.includes(index)) button.classList.add("is-complete");
      if (activeIndex === index) button.setAttribute("aria-current", "step");
      button.innerHTML = `<span class="station-number">${state.completed.includes(index) ? "✓" : String(index + 1).padStart(2, "0")}</span><span class="station-link-label">${station.title}<span class="station-link-subtitle">${station.category}</span></span><span class="station-check" aria-hidden="true">${state.completed.includes(index) ? "✓" : ""}</span>`;
      button.addEventListener("click", () => selectStation(index));
      stationList.append(button);
    });
  }

  function updateSummary() {
    const completed = state.completed.length;
    const score = Object.values(state.scores).reduce((total, points) => total + (Number(points) || 0), 0);
    const text = document.querySelector("#progress-text");
    const scoreText = document.querySelector("#score-text");
    const fill = document.querySelector("#progress-fill");
    if (text) text.textContent = `${completed} de ${stations.length} estaciones completadas`;
    if (scoreText) scoreText.textContent = `${score} ${score === 1 ? "punto" : "puntos"}`;
    if (fill) fill.style.width = `${(completed / stations.length) * 100}%`;
  }

  function selectStation(index) {
    activeIndex = index;
    renderStationList();
    renderChallenge();
  }

  function renderChallenge() {
    const station = stations[activeIndex];
    panel.replaceChildren();
    const heading = document.createElement("div");
    heading.innerHTML = `<p class="challenge-kicker">ESTACIÓN ${String(activeIndex + 1).padStart(2, "0")} <span>·</span> ${station.category}</p><h2 id="challenge-title">${station.title}</h2><p class="challenge-intro">${station.intro}</p>`;
    panel.append(heading);
    const activityCard = document.createElement("div");
    activityCard.className = "activity-card";
    panel.append(activityCard);

    switch (station.type) {
      case "matching": renderMatching(activityCard, activeIndex); break;
      case "choice": renderChoice(activityCard); break;
      case "identity": renderIdentity(activityCard); break;
      case "wall": renderWall(activityCard); break;
      case "family": renderFamily(activityCard); break;
      case "traffic": renderTraffic(activityCard); break;
      case "media": renderMedia(activityCard); break;
      default: throw new Error(`Tipo de estación no reconocido: ${station.type}`);
    }

    if (state.completed.includes(activeIndex)) {
      const complete = document.createElement("p");
      complete.className = "complete-note";
      complete.textContent = "Estación completada. Puedes volver a explorarla cuando quieras.";
      panel.append(complete);
    }
    const navigation = document.createElement("div");
    navigation.className = "station-navigation";
    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "button button-outline";
    previous.textContent = "← Anterior";
    previous.disabled = activeIndex === 0;
    previous.addEventListener("click", () => selectStation(activeIndex - 1));
    const next = document.createElement("button");
    next.type = "button";
    next.className = "button button-primary";
    next.textContent = activeIndex === stations.length - 1 ? "Ir a mi reflexión →" : "Siguiente estación →";
    next.addEventListener("click", () => {
      if (activeIndex < stations.length - 1) selectStation(activeIndex + 1);
      else window.location.href = "reflexion.html";
    });
    navigation.append(previous, next);
    panel.append(navigation);
  }

  function makeCardTitle(container, text) {
    const title = document.createElement("p");
    title.className = "activity-title";
    title.textContent = text;
    container.append(title);
  }

  function feedback(container, text, kind = "") {
    let node = container.querySelector(".activity-feedback");
    if (!node) {
      node = document.createElement("p");
      node.className = "activity-feedback";
      node.setAttribute("aria-live", "polite");
      container.append(node);
    }
    node.className = `activity-feedback${kind ? ` is-${kind}` : ""}`;
    node.textContent = text;
  }

  function renderMatching(container, index) {
    const data = matchingSets[index];
    makeCardTitle(container, index === 0 ? "Haz clic en una idea de cada columna para conectarlas." : "Haz clic en un rasgo y luego en su descripción.");
    const grid = document.createElement("div");
    grid.className = "matching-grid";
    const connections = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    connections.classList.add("connection-layer");
    connections.setAttribute("aria-hidden", "true");
    connections.setAttribute("focusable", "false");
    const leftColumn = document.createElement("div");
    const rightColumn = document.createElement("div");
    leftColumn.className = rightColumn.className = "match-column";
    const leftTitle = document.createElement("p");
    const rightTitle = document.createElement("p");
    leftTitle.className = rightTitle.className = "match-column-title";
    leftTitle.textContent = data.leftTitle;
    rightTitle.textContent = data.rightTitle;
    leftColumn.append(leftTitle);
    rightColumn.append(rightTitle);
    const current = activity(index);
    current.matches = current.matches && typeof current.matches === "object" ? current.matches : {};
    let selectedLeft = "";
    let matchCount = Object.keys(current.matches).length;
    const leftButtons = new Map();
    const rightButtons = new Map();

    const drawConnections = () => {
      const bounds = grid.getBoundingClientRect();
      connections.setAttribute("viewBox", `0 0 ${Math.max(bounds.width, 1)} ${Math.max(bounds.height, 1)}`);
      connections.replaceChildren();
      Object.entries(current.matches).forEach(([leftId, rightId]) => {
        const left = leftButtons.get(leftId);
        const right = rightButtons.get(rightId);
        if (!left || !right) return;
        const leftBounds = left.getBoundingClientRect();
        const rightBounds = right.getBoundingClientRect();
        const x1 = leftBounds.right - bounds.left + 3;
        const x2 = rightBounds.left - bounds.left - 3;
        const y1 = leftBounds.top + leftBounds.height / 2 - bounds.top;
        const y2 = rightBounds.top + rightBounds.height / 2 - bounds.top;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(x1));
        line.setAttribute("y1", String(y1));
        line.setAttribute("x2", String(x2));
        line.setAttribute("y2", String(y2));
        line.setAttribute("stroke", "#1e3a8a");
        line.setAttribute("stroke-width", "2.5");
        line.setAttribute("stroke-linecap", "round");
        connections.append(line);
      });
    };

    data.left.forEach(([id, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-tile";
      button.textContent = label;
      button.dataset.id = id;
      if (current.matches[id]) {
        button.classList.add("is-matched");
        button.disabled = true;
      }
      button.addEventListener("click", () => {
        if (button.disabled) return;
        selectedLeft = id;
        leftButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
        feedback(container, `Seleccionaste «${label}». Ahora elige su pareja.`);
      });
      leftButtons.set(id, button);
      leftColumn.append(button);
    });

    data.right.forEach(([id, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-tile";
      button.textContent = label;
      button.dataset.id = id;
      if (Object.values(current.matches).includes(id)) {
        button.classList.add("is-matched");
        button.disabled = true;
      }
      button.addEventListener("click", () => {
        if (!selectedLeft || button.disabled) {
          feedback(container, "Primero elige una opción de la columna izquierda.");
          return;
        }
        if (selectedLeft === id) {
          current.matches[selectedLeft] = id;
          matchCount += 1;
          leftButtons.get(selectedLeft)?.classList.add("is-matched");
          leftButtons.get(selectedLeft).disabled = true;
          button.classList.add("is-matched");
          button.disabled = true;
          selectedLeft = "";
          leftButtons.forEach((item) => item.classList.remove("is-selected"));
          feedback(container, data.feedback, "success");
          drawConnections();
          save();
          if (matchCount === data.left.length) markComplete(index, data.left.length, "Completaste todas las conexiones y reconociste distintas formas de expresar quién eres.");
        } else {
          feedback(container, "No hay una única manera de ser. Prueba otra conexión y observa qué relación hace sentido.");
          selectedLeft = "";
          leftButtons.forEach((item) => item.classList.remove("is-selected"));
        }
      });
      rightButtons.set(id, button);
      rightColumn.append(button);
    });
    grid.append(leftColumn, rightColumn, connections);
    container.append(grid);
    if (typeof ResizeObserver === "function") {
      const resizeObserver = new ResizeObserver(drawConnections);
      resizeObserver.observe(grid);
    }
    requestAnimationFrame(drawConnections);
    feedback(container, current.matches && matchCount === data.left.length ? data.feedback : "La conexión es una forma de explorar ideas; no es una evaluación de tu personalidad.");
  }

  function renderChoice(container) {
    makeCardTitle(container, "Tómate un momento antes de decidir.");
    const scenario = document.createElement("div");
    scenario.className = "scenario-card";
    const label = document.createElement("p");
    label.textContent = "DILEMA";
    const quote = document.createElement("blockquote");
    quote.textContent = challenges[1].title;
    scenario.append(label, quote);
    const options = document.createElement("div");
    options.className = "option-list";
    const current = activity(1);
    challenges[1].options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-button";
      button.setAttribute("aria-pressed", String(current.choice === index));
      const marker = document.createElement("span");
      marker.className = "option-marker";
      marker.textContent = String.fromCharCode(65 + index);
      const text = document.createElement("span");
      text.textContent = option.label;
      button.append(marker, text);
      button.addEventListener("click", () => {
        current.choice = index;
        current.choiceSaved = true;
        options.querySelectorAll(".option-button").forEach((item, itemIndex) => item.setAttribute("aria-pressed", String(itemIndex === index)));
        feedback(container, option.feedback, "success");
        save();
        markComplete(1, index === 1 ? 2 : 1, "Reflexionaste sobre la libertad, los límites y las consecuencias de una elección.");
      });
      options.append(button);
    });
    container.append(scenario, options);
    if (Number.isInteger(current.choice)) feedback(container, challenges[1].options[current.choice].feedback, "success");
    else feedback(container, "No hay una puntuación moral para tu respuesta. Considera el consentimiento, la privacidad y las consecuencias.");
  }

  function renderIdentity(container) {
    makeCardTitle(container, "Elige exactamente cinco pilares que sientas significativos hoy.");
    const current = activity(2);
    current.selected = Array.isArray(current.selected) ? current.selected : [];
    const cloud = document.createElement("div");
    cloud.className = "tag-cloud";
    identityOptions.forEach((label) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tag-button";
      button.textContent = label;
      button.setAttribute("aria-pressed", String(current.selected.includes(label)));
      button.addEventListener("click", () => {
        if (current.selected.includes(label)) current.selected = current.selected.filter((item) => item !== label);
        else if (current.selected.length < 5) current.selected.push(label);
        else {
          feedback(container, "Ya elegiste cinco. Quita una pieza si quieres cambiar tu selección.");
          return;
        }
        button.setAttribute("aria-pressed", String(current.selected.includes(label)));
        count.textContent = `${current.selected.length} de 5 seleccionados`;
        feedback(container, current.selected.length === 5 ? "Tu identidad también incluye aquello que todavía estás descubriendo." : "No hay una combinación correcta: elige lo que hoy resuena contigo.");
        save();
      });
      cloud.append(button);
    });
    const count = document.createElement("p");
    count.className = "tag-count";
    count.textContent = `${current.selected.length} de 5 seleccionados`;
    const finish = document.createElement("button");
    finish.type = "button";
    finish.className = "button button-primary";
    finish.textContent = "Guardar mis cinco pilares";
    finish.disabled = current.selected.length !== 5;
    cloud.addEventListener("click", () => { finish.disabled = current.selected.length !== 5; });
    finish.addEventListener("click", () => {
      if (current.selected.length !== 5) return;
      markComplete(2, 1, "Elegiste cinco elementos que ayudan a narrar tu identidad actual.");
      feedback(container, `Hoy elegiste: ${current.selected.join(", ")}. Estos pilares pueden cambiar con tu experiencia.`, "success");
    });
    container.append(cloud, count, finish);
    if (state.completed.includes(2)) feedback(container, `Hoy elegiste: ${current.selected.join(", ")}. Estos pilares pueden cambiar con tu experiencia.`, "success");
    else feedback(container, "Tu identidad no cabe en una lista; estas opciones son apenas puntos de partida.");
  }

  function renderWall(container) {
    makeCardTitle(container, "Anota al menos dos fortalezas, esfuerzos o logros que reconozcas en ti.");
    const current = activity(3);
    current.entries = Array.isArray(current.entries) ? current.entries : [];
    const form = document.createElement("form");
    form.className = "entry-form";
    const input = document.createElement("input");
    input.className = "field-input";
    input.type = "text";
    input.maxLength = 100;
    input.placeholder = "Por ejemplo: pedí ayuda cuando la necesitaba";
    input.setAttribute("aria-label", "Escribe una fortaleza o logro");
    const submit = document.createElement("button");
    submit.className = "button button-primary";
    submit.type = "submit";
    submit.textContent = "Añadir";
    form.append(input, submit);
    const list = document.createElement("div");
    list.className = "entry-list";
    const renderEntries = () => {
      list.replaceChildren();
      current.entries.forEach((entry, index) => {
        const card = document.createElement("article");
        card.className = "entry-item";
        const title = document.createElement("strong");
        title.textContent = index % 2 === 0 ? "Algo que reconozco" : "Un paso que di";
        const text = document.createElement("p");
        text.textContent = entry;
        card.append(title, text);
        list.append(card);
      });
    };
    renderEntries();
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) {
        feedback(container, "Escribe una fortaleza, un esfuerzo o un logro concreto.");
        input.focus();
        return;
      }
      if (current.entries.length >= 6) {
        feedback(container, "Tu muro ya tiene seis notas. Vuelve a leerlas y reconoce lo que has logrado.");
        return;
      }
      current.entries.push(value);
      input.value = "";
      renderEntries();
      feedback(container, "Reconocer un paso propio no exige compararlo con el de nadie.", "success");
      save();
      if (current.entries.length >= 2) markComplete(3, 1, "Construiste un pequeño muro de reconocimiento propio.");
    });
    container.append(form, list);
    feedback(container, current.entries.length ? "Cada nota reconoce algo distinto de tu camino." : "Puede ser algo cotidiano: insistir, escuchar, aprender o pedir apoyo.");
    if (current.entries.length >= 2) feedback(container, "Cada nota reconoce algo distinto de tu camino.", "success");
  }

  function renderFamily(container) {
    makeCardTitle(container, "El árbol tiene tres partes. Escribe una idea en cada campo.");
    const current = activity(5);
    current.tree = current.tree && typeof current.tree === "object" ? current.tree : {};
    const form = document.createElement("form");
    form.className = "family-tree";
    const fields = [
      ["roots", "Raíces · un valor o aprendizaje recibido", "Ejemplo: cuidar a quienes quiero"],
      ["trunk", "Tronco · una experiencia que te marcó", "Puede ser un reto o un cambio"],
      ["branches", "Ramas · una meta que eliges", "Algo que deseas construir"]
    ];
    fields.forEach(([key, label, placeholder]) => {
      const wrapper = document.createElement("label");
      wrapper.textContent = label;
      const textarea = document.createElement("textarea");
      textarea.className = "field-textarea";
      textarea.name = key;
      textarea.maxLength = 300;
      textarea.placeholder = placeholder;
      textarea.value = typeof current.tree[key] === "string" ? current.tree[key] : "";
      wrapper.append(textarea);
      form.append(wrapper);
    });
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "button button-primary";
    submit.textContent = "Guardar mi árbol";
    form.append(submit);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(fields.map(([key]) => [key, form.elements.namedItem(key).value.trim()]));
      const missing = fields.find(([key]) => !values[key]);
      if (missing) {
        feedback(container, "Completa las raíces, el tronco y las ramas; puedes escribir una frase breve.");
        form.elements.namedItem(missing[0]).focus();
        return;
      }
      current.tree = values;
      save();
      markComplete(5, 1, "Tu árbol recoge aprendizajes, experiencias y un horizonte que eliges.");
    });
    container.append(form);
    feedback(container, "Lo recibido forma parte de tu historia, pero no determina por completo el camino que eliges.");
  }

  function renderTraffic(container) {
    const scenario = challenges[6];
    const current = activity(6);
    current.classifications = current.classifications && typeof current.classifications === "object" ? current.classifications : {};
    const item = scenario.items.find((entry) => !current.classifications[entry.id]) || scenario.items[scenario.items.length - 1];
    makeCardTitle(container, `Situación ${Math.min(Object.keys(current.classifications).length + 1, scenario.items.length)} de ${scenario.items.length} · Clasifica el vínculo.`);
    const card = document.createElement("div");
    card.className = "scenario-card";
    const quote = document.createElement("blockquote");
    quote.textContent = item.text;
    card.append(quote);
    const choices = [
      ["green", "Verde · saludable", "Hay respeto, apoyo y espacio para los límites."],
      ["yellow", "Amarillo · revisar", "Hay señales confusas; conviene conversar y observar."],
      ["red", "Rojo · alerta", "Hay presión, amenaza o vulneración de límites."]
    ];
    const options = document.createElement("div");
    options.className = "traffic-options";
    choices.forEach(([color, label, description]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "traffic-button";
      button.dataset.color = color;
      const heading = document.createElement("span");
      heading.className = "traffic-heading";
      const light = document.createElement("span");
      light.className = `traffic-light ${color}`;
      const text = document.createElement("span");
      text.textContent = label;
      heading.append(light, text);
      const detail = document.createElement("p");
      detail.textContent = description;
      button.append(heading, detail);
      button.setAttribute("aria-pressed", String(current.classifications[item.id] === color));
      button.addEventListener("click", () => {
        const expected = { "friend-1": "green", "friend-2": "yellow", "friend-3": "red" }[item.id];
        current.classifications[item.id] = color;
        options.querySelectorAll(".traffic-button").forEach((entry) => entry.setAttribute("aria-pressed", String(entry.dataset.color === color)));
        save();
        const response = color === expected
          ? "Bu lectura pone atención a señales importantes. En la vida real, también importa cómo te sientes y el contexto."
          : `Considera qué señal aparece: ${item.id === "friend-3" ? "una amenaza y la difusión de algo privado requieren apoyo y protección" : item.id === "friend-2" ? "la duda invita a conversar, poner un límite y observar" : "el respeto al «no» y la reciprocidad son señales de cuidado"}.`;
        feedback(container, response, color === expected ? "success" : "");
        if (Object.keys(current.classifications).length === scenario.items.length) markComplete(6, 2, "Recorriste el semáforo reconociendo apoyo, dudas y alertas.");
        else window.setTimeout(() => renderChallenge(), 700);
      });
      options.append(button);
    });
    container.append(card, options);
    feedback(container, "Si una situación real te asusta o te hace sentir inseguro/a, busca apoyo de una persona adulta de confianza.");
  }

  function renderMedia(container) {
    const current = activity(7);
    current.answers = current.answers && typeof current.answers === "object" ? current.answers : {};
    const item = challenges[7].find((entry, index) => !Object.hasOwn(current.answers, index)) || challenges[7][challenges[7].length - 1];
    const itemNumber = challenges[7].indexOf(item);
    makeCardTitle(container, `Publicación ${Math.min(Object.keys(current.answers).length + 1, challenges[7].length)} de ${challenges[7].length} · Lee críticamente.`);
    const card = document.createElement("div");
    card.className = "myth-card";
    const label = document.createElement("span");
    label.className = "myth-label";
    label.textContent = "PERFIL FICTICIO · TEXTO DE UNA PUBLICACIÓN";
    const quote = document.createElement("h3");
    quote.textContent = item.myth;
    const description = document.createElement("p");
    description.textContent = "Una frase breve no cuenta toda la vida de quien publica ni de quien la observa.";
    card.append(label, quote, description);
    const options = document.createElement("div");
    options.className = "option-list";
    [["fact", "Hecho razonable"], ["myth", "Mito o conclusión no demostrada"]].forEach(([answer, text], index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-button";
      button.setAttribute("aria-pressed", String(current.answers[itemNumber] === answer));
      const marker = document.createElement("span");
      marker.className = "option-marker";
      marker.textContent = String.fromCharCode(65 + index);
      const labelText = document.createElement("span");
      labelText.textContent = text;
      button.append(marker, labelText);
      button.addEventListener("click", () => {
        current.answers[itemNumber] = answer;
        options.querySelectorAll(".option-button").forEach((option, optionIndex) => option.setAttribute("aria-pressed", String((optionIndex === 0 ? "fact" : "myth") === answer)));
        const response = answer === item.answer
          ? item.explanation
          : `La mejor lectura es ${item.answer === "myth" ? "un mito o una conclusión no demostrada" : "un hecho razonable"}. ${item.explanation}`;
        feedback(container, response, answer === item.answer ? "success" : "");
        save();
        if (Object.keys(current.answers).length === challenges[7].length) markComplete(7, 3, "Terminaste la auditoría: una vitrina nunca cuenta toda la historia.");
        else window.setTimeout(() => renderChallenge(), 850);
      });
      options.append(button);
    });
    container.append(card, options);
    if (Object.hasOwn(current.answers, itemNumber)) {
      const answer = current.answers[itemNumber];
      const response = answer === item.answer
        ? item.explanation
        : `La mejor lectura es ${item.answer === "myth" ? "un mito o una conclusión no demostrada" : "un hecho razonable"}. ${item.explanation}`;
      feedback(container, response, answer === item.answer ? "success" : "");
    }
    else feedback(container, "Piensa qué puede saberse y qué no a partir de una sola publicación.");
  }

  renderStationList();
  updateSummary();
  renderChallenge();

  const hashMatch = window.location.hash.match(/^#estacion-(\d+)$/);
  if (hashMatch) {
    const requestedIndex = Number(hashMatch[1]) - 1;
    if (Number.isInteger(requestedIndex) && requestedIndex >= 0 && requestedIndex < stations.length) {
      activeIndex = requestedIndex;
      renderStationList();
      renderChallenge();
    }
  }
})();
