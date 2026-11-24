/*
  Portfolio content lives here so the layout can stay reusable.
  Add another top-level object to create another portfolio collection.
*/
window.portfolios = {
  "data-science": {
    label: "Portfolio 01 / Data Science",
    title: "Turning messy questions into useful evidence.",
    summary:
      "A growing collection of Python, SQL, statistics, and visualization projects focused on explaining what the data is saying.",
    status: "Building a practical data science foundation",
    stats: [
      { value: "03", label: "Project concepts" },
      { value: "04", label: "Core tools" },
      { value: "∞", label: "Questions to explore" }
    ],
    workTitle: "Projects with a clear next step.",
    workIntro:
      "These starter entries are intentionally small. Replace them with finished work, notebooks, case studies, or experiments.",
    projects: [
      {
        tag: "Python · Data visualization",
        title: "Transit Delay Explorer",
        description:
          "A portfolio-ready concept for exploring route delays, peak periods, and reliability in a public transportation dataset.",
        outcome: "Focus: cleaning, exploratory analysis, and clear charts",
        status: "Prototype",
        href: "#"
      },
      {
        tag: "SQL · Data modeling",
        title: "Operations Query Lab",
        description:
          "A collection of SQL questions that turns a small relational dataset into decisions a transport operations team can act on.",
        outcome: "Focus: joins, aggregation, constraints, and documentation",
        status: "Planning",
        href: "#"
      },
      {
        tag: "Statistics · Research notes",
        title: "Methods Notebook",
        description:
          "Short explanations of probability, sampling, and inference written alongside small reproducible examples.",
        outcome: "Focus: mathematical intuition and reproducibility",
        status: "Ongoing",
        href: "#"
      }
    ],
    about:
      "I’m building toward practical data science by connecting programming, mathematics, business questions, and careful communication. This portfolio is a record of the questions I investigate and the systems I build to answer them.",
    focus: [
      "Make analysis understandable to a non-technical reader.",
      "Use small projects to strengthen mathematical and programming fundamentals.",
      "Document the assumptions behind every result."
    ],
    graph: {
      title: "A visual map of data science foundations.",
      description:
        "This panel is ready for an Obsidian graph export. Keep the exported HTML and its asset folders together when you copy it into this repository.",
      url: "graph/index.html"
    }
  },

  "computer-science": {
    label: "Portfolio 02 / Computer Science",
    title: "Understanding systems by building small ones.",
    summary:
      "A second collection for C, Python, Linux, databases, and the computer science ideas that make software easier to reason about.",
    status: "Exploring systems, software, and the command line",
    stats: [
      { value: "03", label: "Project concepts" },
      { value: "05", label: "Core topics" },
      { value: "01", label: "Linux home base" }
    ],
    workTitle: "Small systems, carefully understood.",
    workIntro:
      "Use this collection for programming projects that show how you think: constraints, tradeoffs, tests, and readable implementation.",
    projects: [
      {
        tag: "C · Linux",
        title: "Markdown Notes in C",
        description:
          "A lightweight command-line notes application that makes file I/O, parsing, and data structures tangible.",
        outcome: "Focus: memory, text processing, and Unix workflows",
        status: "Designing",
        href: "#"
      },
      {
        tag: "Python · Algorithms",
        title: "Algorithm Visual Notes",
        description:
          "A set of compact demonstrations that connect an algorithm’s steps to its time and space behavior.",
        outcome: "Focus: correctness, complexity, and communication",
        status: "Prototype",
        href: "#"
      },
      {
        tag: "Databases · Reliability",
        title: "Transaction Log Simulator",
        description:
          "A small simulation of write-ahead logging that shows how recovery protects data during an unexpected failure.",
        outcome: "Focus: persistence, ordering, and recovery reasoning",
        status: "Planning",
        href: "#"
      }
    ],
    about:
      "This collection is for learning computer science from the inside out: write a small program, observe the machine model underneath it, and explain the design decisions in plain language.",
    focus: [
      "Prefer projects that make an invisible mechanism observable.",
      "Keep the first implementation small enough to test thoroughly.",
      "Write notes that future me can use as documentation."
    ],
    graph: {
      title: "A visual map of computer science topics.",
      description:
        "Each portfolio can point to its own graph file. Replace this URL with a different Obsidian export when the collection needs a separate map.",
      url: "graph/index.html"
    }
  },

  "mathematics": {
    label: "Portfolio 03 / Mathematics",
    title: "Following the structure beneath the calculation.",
    summary:
      "A learning portfolio for arithmetic, algebra, precalculus, proof, and the mathematical ideas that support future data work.",
    status: "Strengthening foundations one concept at a time",
    stats: [
      { value: "05", label: "Study threads" },
      { value: "02", label: "Proof habits" },
      { value: "∞", label: "Connections" }
    ],
    workTitle: "Notes that make the structure visible.",
    workIntro:
      "A mathematics portfolio can hold worked examples, proof attempts, visual explanations, and short reflections on how concepts connect.",
    projects: [
      {
        tag: "Precalculus · Functions",
        title: "Function Map",
        description:
          "A visual reference connecting transformations, inverse functions, composition, and the graphs that represent them.",
        outcome: "Focus: relationships, not isolated formulas",
        status: "Ongoing",
        href: "#"
      },
      {
        tag: "Proof · Logic",
        title: "Proof Practice Log",
        description:
          "A record of proof attempts with attention to definitions, hidden assumptions, and the exact point where an argument succeeds or fails.",
        outcome: "Focus: precision and revision",
        status: "Ongoing",
        href: "#"
      },
      {
        tag: "Applied mathematics",
        title: "Models in Context",
        description:
          "Short examples showing how equations become models for rates, growth, geometry, or real-world systems.",
        outcome: "Focus: translating between words, graphs, and symbols",
        status: "Planning",
        href: "#"
      }
    ],
    about:
      "This collection treats mathematics as both a language and a way of seeing structure. The goal is not only to get an answer, but to understand why the method works and where it applies.",
    focus: [
      "Write definitions before using theorems or procedures.",
      "Compare symbolic, graphical, numerical, and verbal views.",
      "Keep incorrect attempts because they reveal the learning path."
    ],
    graph: {
      title: "A visual map of the mathematics path.",
      description:
        "The graph area is shared by every portfolio view, but its source can be changed independently in data.js.",
      url: "graph/index.html"
    }
  }
};
