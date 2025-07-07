# Handic-App CMS

This project consists of a React frontend and a Strapi backend.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Getting Started

### Environment Variables

#### Frontend

In the `frontend` directory, create a `.env` file and add the following line:

```
VITE_API_BASE_URL=http://localhost:1337/api
```

This points the frontend to your local Strapi instance.

#### Backend

In the `strapi` directory, create a `.env` file by copying the example file:

```bash
cp .env.example .env
```

You can leave the default values for local development.

### Frontend

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
    or
    ```bash
    yarn
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    or
    ```bash
    yarn dev
    ```

The frontend will be available at `http://localhost:5173`.

### Backend (Strapi)

1.  Navigate to the `strapi` directory:
    ```bash
    cd strapi
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run develop
    ```

The Strapi admin panel will be available at `http://localhost:1337/admin`.

### Strapi Credentials

-   **Email:** tslezak4@gmail.com
-   **Password:** Password123
