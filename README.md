Frontend and Backend of MARAG

## TODO:

1. Modify plan

2. AI Edit

3. History

## Build:
#### Frontend:
1. go to my-creat-app folder, `npm install`

2. `npm run dev`

#### Docker:
1. `source .env`

2. `docker-compose -f docker-compose-sdmarag.yaml up -d`

#### ollama:
if using ollama

1. `brew install Ollama/tap/ollama`

2. `ollama pull llama3`

3. `ollama serve --host 0.0.0.0 --port 11434`

#### Backend:
Make sure to install poetry and dependencies for the first time: 
1. `curl -sSL https://install.python-poetry.org | python3 -`
2. `echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc`
3. `source ~/.bashrc`

Run backend: (You can ignore warnings)
1. `poetry run bash start.sh`
## USE:

#### UI
visit http://localhost:5173/

#### API
visit http://localhost:9092/

#### Track MongoDB
1. Install and open the app "MongoDB Compass" (Download link: https://www.mongodb.com/products/tools/compass)
2. Set URI: `mongodb://localhost:27017`
3. Go to tab Advanced Connection Options-Authentication
4. Username: `admin`, Password: `admin` (same as `MONGO_ROOT_USER` and `MONGO_ROOT_PASS` in `.env`)