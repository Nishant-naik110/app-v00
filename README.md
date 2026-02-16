This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

[Multi select](https://github.com/sersavan/shadcn-multi-select-component)

## Project Structure

```
project/
├── public/                     # Static assets like images, fonts, etc.
│   └── assets/
│       └── images/
├── src/                        # Main source directory
│   ├── app/                    # Next.js 13+ routing system (App Directory)
│   │   ├── app/ 	            # Feature-specific directory (app)
│   │   │   ├── components/     # Feature-specific components
│   │   │   ├── pages/          # Feature-specific pages
│   │   │   ├── services/       # API calls using React Query for App
│   │   │   └── utils/          # Utility functions for App
│   │   ├── web/           		# Feature-specific directory (Web)
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/       # API calls using React Query for Web
│   │   │   └── utils/
│   │   ├── api/                # API routes for server-side logic
│   │   ├── layouts/            # Shared layouts across pages or features
│   │   └── (pages)/            # Other global pages (Login, Docs)
│   ├── components/             # Global/shared components
│   │   └── UI/                 # UI-specific reusable components (e.g., buttons, inputs)
│   ├── context/                # Global React context (e.g., authentication)
│   ├── hooks/                  # Custom hooks (e.g., React Query hooks)
│   ├── services/               # Global API services using React Query
│   ├── store/                  # Global state management (Redux, Zustand, if needed)
│   ├── styles/                 # Global styles, Tailwind configuration
│   ├── utils/                  # Global utility functions
│   ├── queries/                # React Query hooks (global query and mutation logic)
│   └── types/                  # TypeScript types and interfaces
├── .env                        # Environment variables
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── next.config.js              # Next.js configuration file
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration file
└── tsconfig.json               # TypeScript configuration
```
