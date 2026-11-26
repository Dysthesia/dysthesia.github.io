/* =====================================================
   HOW THIS FILE WORKS
   1. All your content lives in arrays of objects (like Python lists of dicts).
   2. Small functions turn each array into HTML and insert it into the page.
   To update the site, you mostly edit section 1 and never touch the rest.
   ===================================================== */


/* ========== 1. YOUR DATA (edit this part) ========== */

// tags are used by the filter buttons. Use any words you like, keep spelling consistent.
const projects = [
  { title: "Speaker for Symposium", tags: ["GE Subjects"],  summary: "For Purposive Communication (GE005).",
    details: "A longer description: what it does, what you learned, tools used.", link: "#" },
  { title: "Quadratic Explorer", tags: ["Math, Web"], summary: "Everything about quadratic equations.",
    details: "A longer description.", link: "projects/quadratic-explorer/index.html" },
  { title: "PokeZBLL", tags: ["Math, Web"], summary: "Rubik's Cube ZBLL Algorithms with Pokemon",
    details: "A longer description.", link: "https://docs.google.com/spreadsheets/d/1r5w_EPQsuGDeUnWMEucNFhyCxlwoLmtRhHPSkQnY7oo/edit?usp=sharing" },    
];

// Your personal Big 5: five pillars, each with sub-areas
const bigFive = [
  { name: "Openness", areas: ["High"] },
  { name: "Conscientiousness",     areas: ["Average"] },
  { name: "Extraversion",    areas: ["Average"] },
  { name: "Agreeableness",  areas: ["High"] },
  { name: "Neuroticism", areas: ["High"] },
];

// VIA: list your strengths in rank order. The first 5 get highlighted.
const viaStrengths = ["Love of Learning", "Humor", "Curiousity", "Appreciation of Beauty & Excellence", "Love"];

// SMART = Specific, Measurable, Achievable, Relevant, Time-bound
const goals = [
  { title: "Pass JLPT N4",
    s: "Pass the JLPT N4 exam.",
    m: "Reach the passing score on a practice test before the real one.",
    a: "TODO: weekly study hours that fit around college.",
    r: "A step toward studying in Japan.",
    t: "Exam in July." },
  { title: "Master’s in Data Science in Japan",
    s: "Get accepted into a Master’s program in data science in Japan.",
    m: "TODO: number of programs shortlisted and applications sent.",
    a: "TODO: yearly milestones (math, programming, Japanese).",
    r: "My main long-term direction.",
    t: "Within 4 years." },
];

const wipProjects = [
  { title: "Idea One", status: "Planning", note: "What it is and why you want to build it." },
  { title: "Idea Two", status: "Researching", note: "What it is and why you want to build it." },
];


/* ========== 2. HELPER ========== */

// Find an element by its id. Shorter than typing document.getElementById every time.
const $ = (id) => document.getElementById(id);


/* ========== 3. PROJECTS VIEWER ========== */

let activeFilter = "all";   // remembers which filter button is selected

function renderFilters() {
  // Collect every unique tag. A Set removes duplicates (like set() in Python).
  const allTags = new Set(projects.flatMap(p => p.tags));
  const names = ["all", ...allTags];          // "..." unpacks a collection into a list

  // .map() turns each name into a button string. .join("") glues them together.
  $("filters").innerHTML = names.map(name =>
    `<button data-filter="${name}" aria-pressed="${name === activeFilter}">${name}</button>`
  ).join("");

  // Clicking a button: save the filter, then redraw the buttons and cards.
  $("filters").querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter;      // reads the data-filter="..." attribute
      renderFilters();
      renderProjects();
    });
  });
}

function renderProjects() {
  // .filter() keeps only the items where the function returns true.
  const visible = projects.filter(p => activeFilter === "all" || p.tags.includes(activeFilter));

  $("project-grid").innerHTML = visible.map(p => `
    <button class="card" data-title="${p.title}">
      <h4>${p.title}</h4>
      <p>${p.summary}</p>
    </button>
  `).join("");

  // Clicking a card opens the popup with that project's details.
  $("project-grid").querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const project = projects.find(p => p.title === card.dataset.title);
      $("dialog-title").textContent = project.title;
      $("dialog-body").textContent = project.details;
      $("dialog-link").href = project.link;
      $("project-dialog").showModal();        // built-in popup, Esc also closes it
    });
  });
}

$("dialog-close").addEventListener("click", () => $("project-dialog").close());


/* ========== 4. SELF MAP, GOALS, WIP ========== */

function renderBigFive() {
  $("big5-grid").innerHTML = bigFive.map(pillar => `
    <div class="card">
      <h4>${pillar.name}</h4>
      <ul>${pillar.areas.map(a => `<li>${a}</li>`).join("")}</ul>
    </div>
  `).join("");
}

function renderVia() {
  // (s, i) = the item and its index. Index below 5 means it is a top-5 strength.
  $("via-list").innerHTML = viaStrengths.map((s, i) =>
    `<li class="${i < 5 ? "top" : ""}">${s}</li>`
  ).join("");
}

function renderGoals() {
  $("goal-grid").innerHTML = goals.map(g => `
    <div class="card">
      <h4>${g.title}</h4>
      <ul>
        <li><strong>Specific:</strong> ${g.s}</li>
        <li><strong>Measurable:</strong> ${g.m}</li>
        <li><strong>Achievable:</strong> ${g.a}</li>
        <li><strong>Relevant:</strong> ${g.r}</li>
        <li><strong>Time-bound:</strong> ${g.t}</li>
      </ul>
    </div>
  `).join("");
}

function renderWip() {
  $("wip-list").innerHTML = wipProjects.map(w => `
    <li><strong>${w.title}</strong> <span class="status">${w.status}</span><br>${w.note}</li>
  `).join("");
}


/* ========== 5. START ==========
   Run every render function once when the page loads. */
renderFilters();
renderProjects();
renderBigFive();
renderVia();
renderGoals();
renderWip();

const root = document.documentElement;   // the <html> element

function setTheme(theme) {
  root.dataset.theme = theme;                      // sets data-theme="dark" or "light"
  localStorage.setItem("theme", theme);            // browser's small key-value storage, survives reloads
  $("theme-toggle").textContent = theme === "dark" ? "Light" : "Dark";
}

// On load: use the saved choice, otherwise follow the OS setting.
const saved = localStorage.getItem("theme");
const osPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(saved || (osPrefersDark ? "dark" : "light"));

$("theme-toggle").addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});
