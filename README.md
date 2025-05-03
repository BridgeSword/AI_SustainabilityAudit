# MARAG — Frontend and Backend Setup Guide

This repository contains the frontend and backend components for the **MARAG** project. The application includes a React-based frontend, a FastAPI-based backend, and supporting services managed via Docker.

---

## 🛠️ Build and Run Instructions

### 📦 Frontend

1. Navigate to the frontend directory:

   ```bash
   cd my-react-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

---

### 🐳 Docker Services

1. Load environment variables:

   ```bash
   source .env
   ```

2. Start all services defined in the Docker Compose file:

   ```bash
   docker-compose -f docker-compose-sdmarag.yaml up -d
   ```

> **Note**: Ensure Docker and Docker Compose are installed and running on your system.

---

### 🤖 Ollama (Optional: If Using Local LLM Inference)

If you are using [Ollama](https://ollama.com/) for local inference with LLaMA models:

1. Install Ollama:

   ```bash
   brew install Ollama/tap/ollama
   ```

2. Download the desired model:

   ```bash
   ollama pull llama3
   ```

3. Start the Ollama server:

   ```bash
   ollama serve --host 0.0.0.0 --port 11434
   ```

---

### 🧬 Backend

#### One-Time Setup (First Use)

Install [Poetry](https://python-poetry.org/docs/#installation):

1. Install Poetry:

   ```bash
   curl -sSL https://install.python-poetry.org | python3 -
   ```

2. Add Poetry to your shell’s PATH:

   ```bash
   echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc
   ```

#### Running the Backend

Use Poetry to run the backend startup script:

```bash
poetry run bash start.sh
```

> ⚠️ Warnings during launch can typically be ignored unless they halt execution.

---

## 🚀 Usage

### 🌐 Accessing the UI

Once the frontend server is running, open your browser and go to:

```
http://localhost:5173/
```

### 🥪 Accessing the API

The FastAPI backend will be available at:

```
http://localhost:9092/
```

---

## 📊 Monitoring MongoDB

To inspect the MongoDB instance used by the backend:

1. Download and install [MongoDB Compass](https://www.mongodb.com/products/tools/compass)
2. Launch the application and connect using the following URI:

   ```
   mongodb://localhost:27017
   ```
3. Go to **Advanced Connection Options > Authentication**

   * **Username**: `admin`
   * **Password**: `admin`

> These credentials correspond to `MONGO_ROOT_USER` and `MONGO_ROOT_PASS` in your `.env` file.
