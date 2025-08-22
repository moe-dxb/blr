# BLR WORLD HUB — Repo Snapshot

- package.json: FOUND
- .firebaserc: FOUND
- firebase.json: FOUND
- firestore.rules: FOUND
- firestore.indexes.json: FOUND
- storage.rules: FOUND
- functions/package.json: FOUND
- functions/index.js: missing
- functions/src/index.ts: FOUND
- src/main.tsx: missing
- src/main.jsx: missing
- src/App.tsx: missing
- src/App.vue: missing
- next.config.js: missing
- vite.config.ts: missing
- vite.config.js: missing

## package.json
```json
{
  "name": "nextn",
  "deps": {
    "@genkit-ai/googleai": "^1.16.1",
    "@hookform/resolvers": "^3.6.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-label": "^2.0.0",
    "@radix-ui/react-popover": "^1.0.0",
    "@radix-ui/react-radio-group": "^1.1.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.0.0",
    "@radix-ui/react-tooltip": "^1.0.0",
    "@tiptap/react": "^2.6.6",
    "@tiptap/starter-kit": "^2.6.6",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "date-fns": "^2.30.0",
    "embla-carousel-react": "^8.6.0",
    "firebase": "^10.11.0",
    "genkit": "^1.16.1",
    "lucide-react": "^0.447.0",
    "next": "15.4.6",
    "react": "18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "18.3.1",
    "react-hook-form": "^7.51.3",
    "recharts": "^3.1.2",
    "tailwind-merge": "^2.3.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.8"
  },
  "devDeps": {
    "eslint": "^8.57.1",
    "eslint-config-next": "^15.4.6"
  }
}
```

## functions/package.json
```json
{
  "engines": {
    "node": "20"
  },
  "deps": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.1.0",
    "luxon": "^3.5.0",
    "nodemailer": "^6.9.13",
    "uuid": "^10.0.0",
    "googleapis": "^155.0.1",
    "@google-cloud/vertexai": "^1.9.0"
  }
}
```

## firebase.json
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log",
        "*.local"
      ],
      "predeploy": [
        "npm --prefix \"$RESOURCE_DIR\" run build"
      ]
    }
  ],
  "storage": {
    "rules": "storage.rules"
  },
  "hosting": {
    "source": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "frameworksBackend": {
      "region": "us-central1"
    }
  }
}
```