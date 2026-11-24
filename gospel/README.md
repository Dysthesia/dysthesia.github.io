# Portfolio System

A buildless HTML/CSS/JavaScript portfolio starter for GitHub Pages.

## Structure

```text
.
├── index.html        # Reusable page layout
├── styles.css        # Visual design and responsive layout
├── data.js           # Portfolio collections and project content
├── script.js         # Portfolio switching and graph embedding
├── graph/
│   └── index.html    # Replace with an Obsidian graph export
└── .nojekyll         # Prevents GitHub Pages Jekyll processing
```

## Run locally

From this folder:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Add another portfolio

Open `data.js` and add another top-level object inside `window.portfolios`:

```js
"japanese-study": {
  label: "Portfolio 04 / Japanese Study",
  title: "...",
  summary: "...",
  status: "...",
  stats: [],
  workTitle: "...",
  workIntro: "...",
  projects: [],
  about: "...",
  focus: [],
  graph: {
    title: "...",
    description: "...",
    url: "graph/japanese-study.html"
  }
}
```

The page automatically adds it to the portfolio selector. You can open a specific collection with a URL such as:

```text
https://your-username.github.io/your-repository/?portfolio=mathematics
```

## Add an Obsidian graph HTML file

1. Copy the exported HTML file and all of its companion assets into this repository.
2. Keep the relative folder structure from the export.
3. Set the matching `graph.url` in `data.js`, for example:

   ```js
   url: "graph/obsidian.html"
   ```

You can also use an external HTTPS URL, but the remote host must allow the page to be embedded in an iframe. If it blocks framing, use the **Open graph separately** link instead.

## Publish through GitHub Pages

If the repository already exists locally, copy these files into its root and run:

```bash
git add .
git commit -m "Add portfolio starter"
git push origin main
```

On GitHub, open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save. GitHub Pages will use `index.html` as the entry point.

If the repository is new, create it on GitHub first, then connect it with:

```bash
git init
git branch -M main
git add .
git commit -m "Add portfolio starter"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the placeholder content in `data.js` as you develop. The layout does not need to change when you add projects or portfolio collections.
