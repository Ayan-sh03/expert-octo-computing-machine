# Materials Search & Compare

This project allows searching and comparing materials data from the Materials Project.

## Backend

### Setup & Run

1.  Navigate to the `backend` directory.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Create a `.env` file and add your API key:
    ```
    MP_API_KEY="YOUR_MATERIALS_PROJECT_API_KEY"
    ```
4.  Run the application:
    ```bash
    python app.py
    ```

## Frontend

### Setup & Run

1.  Navigate to the `frontend` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file and add the backend URL:
    ```
    NEXT_PUBLIC_BACKEND_URL="http://localhost:5000"
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
