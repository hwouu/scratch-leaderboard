# GEMINI.md

## Project Overview

This project is a web application that displays a leaderboard for a golf tournament. It consists of a Python backend that fetches data from the Golfzon API and a simple HTML, CSS, and JavaScript frontend that displays the data. The application is designed to be deployed as a serverless function on Vercel.

**Key Technologies:**

*   **Backend:** Python, `requests`
*   **Frontend:** HTML, CSS, JavaScript
*   **Deployment:** Vercel

**Architecture:**

*   The backend is a single Python script (`api/index.py`) that acts as a serverless function. It fetches data from multiple Golfzon API endpoints in parallel and returns the combined data as a single JSON object.
*   The frontend is a single-page application that fetches data from the backend API and dynamically renders the leaderboard. It features tabs to switch between different views of the leaderboard (total, course A, course B, course C). The frontend also includes a dark mode theme and persists the user's theme and selected tab in local storage.
*   The project is configured for deployment on Vercel using the `vercel.json` file. This file defines the build process for the backend and frontend, as well as the routing rules for the application.

## Building and Running

This project is designed for serverless deployment on Vercel, so there is no traditional build or run process for local development. However, you can run the frontend and backend separately for testing purposes.

**Running the Backend:**

To run the backend locally, you can use the Vercel CLI:

```bash
vercel dev
```

This will start a local development server that simulates the Vercel environment. The backend API will be available at `http://localhost:3000/api`.

**Running the Frontend:**

You can open the `frontend/index.html` file directly in your web browser to view the frontend. However, to fetch data from the backend, you will need to have the backend running locally and update the `apiEndpoint` variable in `frontend/script.js` to point to your local server.

## Development Conventions

*   The backend code is located in the `api` directory.
*   The frontend code is located in the `frontend` directory.
*   The `vercel.json` file is used to configure the Vercel deployment.
*   The `requirements.txt` file lists the Python dependencies for the backend.
*   The frontend uses local storage to persist the user's preferred theme (dark/light) and the last selected leaderboard tab.
*   The leaderboard automatically refreshes every 5 minutes.