# CXentric

A modern React-based project utilizing the latest frontend technologies and tools for building responsive web applications.

## 🚀 Features

*  **React 18** - React version with improved rendering and concurrent features
*  **Vite** - Lightning-fast build tool and development server
*  **Redux Toolkit** - State management with simplified Redux setup
*  **TailwindCSS** - Utility-first CSS framework with extensive customization
*  **React Router v6** - Declarative routing for React applications
*  **Data Visualization** - Integrated D3.js and Recharts for powerful data visualization
*  **Form Management** - React Hook Form for efficient form handling
*  **Animation** - Framer Motion for smooth UI animations
*  **Testing** - Jest and React Testing Library setup

## 📋 Prerequisites

* Node.js (v14.x or higher)
* npm or yarn

## 🛠️ Installation

1. Install dependencies:

   ```bash
   npm install
   ```
2. Create your environment file and add your keys:

   ```bash
   cp .env.example .env
   ```
   `OPENAI_API_KEY` is read **only by the server** and is never sent to the browser.
   Only variables prefixed with `VITE_` are bundled into client code, so never put secrets in a `VITE_` variable.
3. Start the development server (the app and the `/api` routes run together):

   ```bash
   npm start
   ```

## 🤖 AI API

All OpenAI calls go through the server in `server/`:

* `server/openai.mjs` — OpenAI client and prompts
* `server/api.mjs` — `/api/ai/*` routes with input limits and a per-IP rate limit (`AI_RATE_LIMIT_PER_MINUTE`, default 20)
* `server/index.mjs` — production server that serves `build/` plus the API

The browser uses `src/services/openaiService.js`, which calls these routes.

## 📁 Project Structure

```plaintext
react_app/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── styles/         # Global styles and Tailwind configuration
│   ├── services/       # Client API wrappers
│   ├── App.jsx         # Main application component
│   ├── Routes.jsx      # Application routes
│   └── index.jsx       # Application entry point
├── api/                # Vercel serverless functions (/api/ai/*)
├── server/             # API logic, OpenAI calls, standalone production server
├── vercel.json         # Vercel build/routing config
├── .env.example        # Environment variable template
├── index.html          # HTML template
├── package.json        # Project dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration
```

## 🧩 Adding Routes

To add new routes to the application, update the `Routes.jsx` file:

```jsx
import { useRoutes } from "react-router-dom";
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <AboutPage /> },
    // Add more routes as needed
  ]);

  return element;
};
```

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:

* Forms plugin for form styling
* Typography plugin for text styling
* Aspect ratio plugin for responsive elements
* Container queries for component-specific responsive design
* Fluid typography for responsive text
* Animation utilities

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.

## 📦 Deployment

Build and run the production server (any Node 18+ host):

```bash
npm run build
npm run serve
```

Set `OPENAI_API_KEY` (and optionally `PORT`) in the host's environment.

### Vercel

The repo deploys to Vercel as-is: `vercel.json` sets the `build` output folder and client-side routing,
and each `/api/ai/*` route is a serverless function in `api/` that reuses `server/api.mjs`.
Add `OPENAI_API_KEY` under **Project → Settings → Environment Variables**, then redeploy.

## 🙏 Acknowledgments

* Built with [Rocket.new](https://rocket.new)
* Powered by React and Vite
* Styled with Tailwind CSS