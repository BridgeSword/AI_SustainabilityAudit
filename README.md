# SMARAG (Self-decisive Multi-Agentic Retrieval Augmented Generation) — Frontend and Backend Setup Guide

This repository contains the frontend and backend components for the **MARAG** project. The application includes a React-based frontend, a FastAPI-based backend, and supporting services managed via Docker.

---

## 🛠️ Build and Run Instructions

### 📦 Frontend

1. Navigate to the frontend directory:

   ```bash
   cd client
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

### 🤖 Ollama (Optional: If Using Local LLM Inference)_MAC version installation

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

### 🤖 Ollama (Optional: If Using Local LLM Inference)_Linux version installation

1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
2. Verify the installation of Ollama
ollama --version
3. Pull and Run LLaMA 3 Model
ollama pull llama3
4. Once the model is downloaded, you can run it with:
ollama run llama3 input "Hello, how can I use this model for NLP tasks?"
5. ⚙️ Optional: Add Ollama as a Startup Service
For convenience, you can set up Ollama to start automatically with your system:

Create a user and group for Ollama:
sudo useradd -r -s /bin/false -U -m -d /usr/share/ollama ollama
sudo usermod -a -G ollama $(whoami)

Create a systemd service file:
sudo nano /etc/systemd/system/ollama.service
Add the following content:

ini

[Unit]
Description=Ollama Service
After=network-online.target

[Service]
ExecStart=/usr/bin/ollama serve
User=ollama
Group=ollama
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
Reload systemd and enable the service:

sudo systemctl daemon-reload
sudo systemctl enable ollama
sudo systemctl start ollama
This will start Ollama as a background service.

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
