# Life OS Dashboard

A local-first Life OS built with React and Tailwind CSS to gamify personal growth. Track identity, goals, XP, routines, and time blocks while syncing with Google Calendar and letting the built-in planner chatbot orchestrate your day.

## ✨ Features
- Minimal, monochrome dashboard with responsive layout and mobile nav.
- Identity blueprint card to edit profile, goals, and progress at any time.
- Real-time momentum stats, countdown to your target age, achievements, and avatar glow.
- Drag-and-drop time blocking with AI suggestions, Google Calendar sync, and reminder notifications.
- Progress analytics, trajectory forecasting, weekly review prompts, habit engine, and life snapshots.
- Chatbot intake that converts your daily summary into time blocks automatically.

All data is persisted to `localStorage`, so everything stays on-device.

## 🚀 Getting started
1. **Install dependencies**
   ```bash
   npm install
   ```
   > If your environment blocks registry access, run the command on a machine with internet access first.

2. **Run the dev server**
   ```bash
   npm run dev
   ```
   Vite will print a local URL (default `http://localhost:5173`) where you can use the app. Hot reloading is enabled.

3. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```
   Preview serves the optimized build locally for smoke-testing.

## 🔐 Google Calendar integration
1. Create a Google Cloud project and enable the **Google Calendar API**.
2. Configure an OAuth consent screen (internal/personal) and create an **OAuth Client ID** (type: Web application) plus an **API key**.
3. Add the local dev URL (e.g. `http://localhost:5173`) and your eventual GitHub Pages domain to the OAuth authorized JavaScript origins.
4. In the running app, open the “Init Google” button in the top bar, paste the **Client ID** and **API key**, then sign in.
5. Once connected, events from your primary calendar appear in the dashboard and are mirrored into the planner. New blocks you add can be pushed back to Google.

> The credentials are stored only in browser memory—repeat the init step if you reload the page or move devices.

## 🤖 Planner chatbot
- Share a quick summary in the “Trajectory Chatbot” card (e.g., “Deep work, gym, meditation”).
- The bot detects key themes and schedules blocks in today’s planner while logging the conversation history.
- You can fine-tune blocks afterward via drag-and-drop or by editing/deleting them manually.

## 🧭 Weekly review & reminders
- A reflection modal appears automatically every seven days so you can journal wins, lessons, and next week’s focus.
- In-app notifications remind you about blocks that start within the next 15 minutes. Enable sound effects via the top bar toggle if you want an audio cue.

## 📤 Backups
Use the **Export** button in the top bar to download your current state as `life-os-backup.json`. Importing is as simple as replacing `localStorage` with the exported JSON via browser devtools.

## 🌐 Deploying to GitHub Pages
The project is preconfigured for GitHub Pages using the `gh-pages` npm package. Follow these steps:

1. **Set the repository base path**
   - If your project is served from `https://<username>.github.io/<repo>/`, create a file named `.env.production` at the repo root with:
     ```env
     VITE_PUBLIC_BASE=/<repo>/
     ```
   - For user/organization pages (`https://<username>.github.io`), leave the value empty.

2. **Build and deploy**
   ```bash
   npm run predeploy   # runs the production build
   npm run deploy      # pushes dist/ to the gh-pages branch
   ```
   The script will publish the contents of `dist` to the `gh-pages` branch.

3. **Enable GitHub Pages**
   - In your repository settings → Pages, choose the `gh-pages` branch with the `/` root.
   - After GitHub finishes the build, your dashboard will be live at the configured URL.

### Optional: GitHub Actions automation
You can automate deployments by adding a workflow similar to:
```yaml
name: Deploy Life OS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
        env:
          VITE_PUBLIC_BASE: /<repo>/
      - run: npx gh-pages -d dist -u "github-actions-bot <actions@github.com>"
```
Remember to replace `<repo>` with the repository name and grant the workflow permission to write to the `gh-pages` branch (Repository settings → Actions → General → Workflow permissions).

## 🛠️ Customization tips
- Tailwind config exposes the monochrome palette under `base`. Extend or adjust colors to match your aesthetic.
- All dashboard sections are modular React components, so you can plug in new cards (e.g., journaling, social accountability) without rewiring global state.
- App state lives in `src/context/AppContext.jsx`. The reducer pattern makes it straightforward to add new actions or persistence logic.

## 🧪 Linting
Run ESLint to keep the codebase clean:
```bash
npm run lint
```

Enjoy building your personalized Life OS!
