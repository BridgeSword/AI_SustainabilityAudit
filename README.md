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

1. Start all services defined in the Docker Compose file:

   ```bash
   docker-compose -f docker-compose-sdmarag.yaml up -d
   ```
   
   NOTE: `docker-compose-sdmarag` is present in root directory (MARAG)

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
   ollama pull llama3.2
   ```

3. Start the Ollama server:

   ```bash
   ollama serve --host 0.0.0.0 --port 11434
   ```

### 🤖 Ollama (Optional: If Using Local LLM Inference)_Linux version installation

1. Install Ollama
   
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
    ```
2. Verify the installation of Ollama

   ```bash
   ollama --version
    ```
3. Pull and Run LLaMA 3.2 Model
   ```bash
   ollama pull llama3.2
    ```
4. Once the model is downloaded, you can run it with:
   ```bash
   ollama run llama3.2 input "Hello, how can I use this model for NLP tasks?"
    ```
   
5. ⚙️ Optional: Add Ollama as a Startup Service
      For convenience, you can set up Ollama to start automatically with your system:
   
 
      Create a user and group for Ollama:

    ```bash           
      sudo useradd -r -s /bin/false -U -m -d /usr/share/ollama ollama
      sudo usermod -a -G ollama $(whoami)
    ```  
      Create a systemd service file:
   
     ```bash    
      sudo nano /etc/systemd/system/ollama.service
     ```     
      Add the following content:
     ```bash          
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

      
      [Install]
      WantedBy=default.target
     ```  
      Reload systemd and enable the service:
     ```bash        
      sudo systemctl daemon-reload
      sudo systemctl enable ollama
      sudo systemctl start ollama

     ```
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
   
Install [Anaconda](https://www.anaconda.com/docs/getting-started/miniconda/install#linux):

1. Install Anaconda:
   ```bash
   mkdir -p ~/miniconda3
   wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
   bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
   rm ~/miniconda3/miniconda.sh
   ```
2. Activate Anaconda shell:
   ```bash
   source ~/miniconda3/bin/activate
   ```
3. Initialize conda:
   ```bash
   conda init --all
   ```

Create Virtual Environment:

1. Execute `conda create -n smarag python=3.12`
2. Execute `conda activate smarag`

Install All Packages using Poetry:

`poetry install`


#### Running the Backend

Use Poetry to run the backend startup script:

```bash
sh start.sh
```

> ⚠️ Warnings during launch can typically be ignored unless they halt execution.

---

## 🚀 Usage

### 🌐 Accessing the UI

Once the frontend server is running, open your browser and go to:

```
http://localhost:5173/
```

### 🥪 Accessing the FastAPI Backend

The FastAPI backend will be available at:

```
http://localhost:9092/
```

### 🥪 Accessing VectorDB

The Milvus VectorDB will be available at:

```
http://localhost:8000/
```

### 🥪 Accessing Flower

The Celery Flower will be available at:

```
http://localhost:5555/
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
