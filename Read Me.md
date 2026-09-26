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
2. (Optional) Create your environment file if you use any of the integrations listed in it:

   ```bash
   cp .env.example .env
   ```
   Only variables prefixed with `VITE_` are bundled into client code, and anyone can read them — never put secrets there.
3. Start the development server:

   ```bash
   npm start
   ```

## 🎓 Career Assistant (knowledge base)

The assistant widget works fully offline — no API keys. It is driven by a predefined knowledge base of
**1000 questions and answers** in `src/data/kb/`:

* `industries.js` — IT, BPO, Medicine, Engineering, AI and Teaching: 10 leading companies each, industry facts, and role details per industry
* `roles.js` — CXM, Presales, Developer, QE, Designer, Project Manager, Business Analyst, Data Analyst, Sales and HR profiles
* `index.js` — builds the 1000 Q&As (240 company, 660 role × industry, 60 industry, 40 career) and the quiz options

Widget tabs:

* **Learn** — filter by industry, topic and role, pick a predefined question, and read the answer
* **Quiz** — 5/10/20 multiple-choice questions with instant feedback and a score
* **Tags** — hashtag and content-idea suggestions from the same data (`src/services/knowledgeBase.js`)

To add or change questions, edit the data files; the question count and quiz options update automatically.

## 📁 Project Structure

```plaintext
react_app/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── styles/         # Global styles and Tailwind configuration
│   ├── data/kb/        # Career knowledge base (1000 Q&As)
│   ├── services/       # Knowledge-base helpers (hashtags, content ideas)
│   ├── App.jsx         # Main application component
│   ├── Routes.jsx      # Application routes
│   └── index.jsx       # Application entry point
├── server/             # Standalone static production server (npm run serve)
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

Build and serve the static app (any Node 18+ host):

```bash
npm run build
npm run serve
```

Set `PORT` in the host's environment if needed.

### Vercel

The repo deploys to Vercel as-is: `vercel.json` sets the `build` output folder and client-side routing.
No environment variables are required.

## 🙏 Acknowledgments

* Built with [Rocket.new](https://rocket.new)
* Powered by React and Vite
* Styled with Tailwind CSS