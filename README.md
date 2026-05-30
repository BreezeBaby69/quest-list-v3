# Gamified To-Do List

A productivity app that transforms everyday tasks into a fun, game-like experience. Instead of just checking off items, users earn points, unlock levels, and collect rewards as they complete tasks. The goal is to make productivity feel less like a chore and more like a challenge you want to return to daily.

## ✨ Key Features

*   **Task Creation & Organization:** Add tasks with categories, priorities, and deadlines.
*   **Gamification Layer:**
    *   **XP & Levels:** Completing tasks grants XP; leveling up unlocks achievements.
    *   **Streaks:** Keep a streak alive by finishing tasks daily.
    *   **Virtual Currency:** Earn coins for completed tasks.
    *   **Achievements/Badges:** Earn badges for milestones like "Task Master" and "Streak Master".
*   **Progress Tracking:** A personal dashboard with stats: tasks completed, streak length, etc.

## 🚀 Tech Stack

### Backend
*   Python
*   Flask
*   Flask-SQLAlchemy
*   Flask-Migrate
*   PyJWT for authentication
*   Flask-Cors

### Frontend
*   React
*   React Router
*   Axios
*   React Toastify for notifications

### Database
*   SQLite

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

*   Python 3.8+
*   Node.js and npm

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your_username_/gamified-todo-list.git
    ```
2.  **Backend Setup**
    ```sh
    cd gamified-todo-list/backend
    pip install -r requirements.txt
    flask db upgrade
    flask seed-achievements
    ```
3.  **Frontend Setup**
    ```sh
    cd ../frontend
    npm install
    ```

### Running the Application

You can run both the frontend and backend servers concurrently from the `frontend` directory:

```sh
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

##  API Endpoints

The backend provides the following API endpoints:

*   `POST /api/register`: Register a new user.
*   `POST /api/login`: Log in a user and get a JWT.
*   `GET /api/user`: Get the current user's data.
*   `GET /api/tasks`: Get all tasks for the current user.
*   `POST /api/tasks`: Create a new task.
*   `PUT /api/tasks/<id>`: Update a task.
*   `DELETE /api/tasks/<id>`: Delete a task.
*   `GET /api/achievements`: Get all achievements and the user's earned achievements.

## 📜 License

Distributed under the MIT License.
