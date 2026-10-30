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

### Cloudflare Pages (production)

The site and its small API (`/functions/api`, for payments) run on Cloudflare Pages. Progress lives in each
user's browser; the server keeps only accounts, plans and (for Pro) one progress row per user.

1. **Supabase** (accounts and plans)
   - Create a project, then run [`supabase/schema.sql`](supabase/schema.sql) in **SQL Editor** (safe to re-run).
   - **Authentication → Providers**: turn on **Google** (needs a Google Cloud OAuth client) and **Email**.
   - **Authentication → URL Configuration**: Site URL `https://www.cxentric.in`; add redirect URLs
     `https://www.cxentric.in/**` and `http://localhost:4028/**`.
2. **Razorpay** (payments)
   - Complete KYC, and ask Razorpay support to enable **Subscriptions** with **UPI Autopay**.
   - **Subscriptions → Plans**: create a ₹149 monthly plan and a ₹999 yearly plan; note their `plan_…` ids.
   - **Settings → Webhooks**: URL `https://www.cxentric.in/api/razorpay-webhook`, a secret of your choice, and
     the events `order.paid`, `subscription.activated`, `subscription.charged`, `subscription.pending`,
     `subscription.halted`, `subscription.cancelled`, `subscription.completed`.
   - Test everything with test-mode keys first.
3. **Cloudflare Pages**: Workers & Pages → Create → Pages → connect `cxentric/Onura`.
   Build command `npm run build`, output directory `build`. Under **Settings → Variables and Secrets** add:

   | Variable | Where it comes from | Type |
   | --- | --- | --- |
   | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | plain text (public) |
   | `SUPABASE_URL` | same as above | plain text |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → service_role / secret key | **secret** |
   | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay → Account & Settings → API keys | **secret** |
   | `RAZORPAY_WEBHOOK_SECRET` | the secret you set on the webhook | **secret** |
   | `RAZORPAY_PLAN_MONTHLY`, `RAZORPAY_PLAN_YEARLY` | the plan ids from step 2 | plain text |

   Without the Supabase variables the app runs with accounts off and every feature free.
4. **Domain**: add `cxentric.in` to Cloudflare, change the nameservers at GoDaddy to the two Cloudflare gives you,
   then attach `cxentric.in` and `www.cxentric.in` under the Pages project's **Custom domains**.
   Once it serves the site, remove the domain from Vercel and delete the Vercel project (and `vercel.json`).

`public/_headers` sets the security headers, including a Content-Security-Policy. If you add a script, font or API
from another site, add its host there.

### Plans

Prices and the Free limits are in [`src/config/plans.js`](src/config/plans.js), shared by the app and the API.
Free: Learn, the daily challenge, streaks and one quiz or revision run a day. Pro (₹149/month or ₹999/year, as UPI
Autopay or a one-time pass): unlimited practice, AI Coach, progress sync and the shareable Readiness badge.

### AI Coach

Pro users connect their own AI: a Claude, ChatGPT or Gemini API key, or an OpenRouter account. The key stays in
their browser and goes only to that provider, so CXentric stores no keys and pays nothing for AI. The coach is
told the learner's goal, Readiness Score and missed questions. Set `AI_COACH_PRO_ONLY` to `false` to offer it to everyone.

## 🙏 Acknowledgments

* Built with [Rocket.new](https://rocket.new)
* Powered by React and Vite
* Styled with Tailwind CSS