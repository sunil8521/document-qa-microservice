# Simple RAG System

A full-stack Retrieval-Augmented Generation (RAG) system that allows users to upload documents and ask questions about them. The system uses a microservice architecture to decouple the frontend API from the heavy document processing tasks.

## 🏗️ Architecture

The project is split into three main components:

1. **`simple-rag-client` (Frontend)**
   - The user interface for interacting with the system.
   - Allows users to upload files and chat with the AI.
   - Built with modern frontend tooling (run via `pnpm`).

2. **`simple-rag-backend` (API Server)**
   - A Spring Boot application serving as the main entry point (Port 8080).
   - Handles file uploads by streaming them directly to Cloudflare R2.
   - Publishes processing tasks to RabbitMQ.
   - Manages the chat sessions and uses LangChain4j + Gemini AI to answer user queries using the retrieved document contexts.

3. **`simple-rag-worker` (Background Processor)**
   - A separate Spring Boot application (Port 8081).
   - Listens to the RabbitMQ queue for new document tasks.
   - Downloads the document from Cloudflare R2, extracts the text, and chunks it.
   - Generates vector embeddings using Gemini AI and stores them in PostgreSQL (pgvector).

## 🚀 Tech Stack

- **Backend / Worker:** Java, Spring Boot, LangChain4j
- **AI / LLM:** Google Gemini 2.5 Flash
- **Database / Vector Store:** PostgreSQL (Supabase) with pgvector
- **Message Broker:** RabbitMQ (CloudAMQP / LavinMQ)
- **Object Storage:** Cloudflare R2 (S3 Compatible)

## 🔄 How it Works

### 1. Document Upload (Write Flow)
1. The user uploads a document (e.g., PDF, TXT) via the client.
2. The `backend` receives the file, generates a unique ID, and uploads it to **Cloudflare R2**.
3. The `backend` saves a metadata record in **PostgreSQL** with status `PENDING`.
4. The `backend` publishes a message containing the document ID to **RabbitMQ**.
5. The `worker` consumes the message from RabbitMQ.
6. The `worker` fetches the document from **R2**, extracts the text, splits it into smaller chunks, and generates vector embeddings via **Gemini AI**.
7. The embeddings are stored in **PostgreSQL (pgvector)**, and the document status is updated to `COMPLETED`.

### 2. Chat / Q&A (Read Flow)
1. The user sends a question in the chat interface.
2. The `backend` receives the question and uses **Gemini** to generate an embedding for the user's query.
3. It performs a **semantic search** in the PostgreSQL vector store to find the most relevant document chunks (ContentRetriever).
4. The retrieved context is passed along with the user's question to the **Gemini AI** model.
5. The AI generates a natural language response strictly based on the provided document context and returns it to the client.

## 🛠️ How to Run Locally

### Prerequisites
- JDK 17+
- Node.js & pnpm
- Valid API keys in `application.properties` (Gemini, Supabase, Cloudflare R2, RabbitMQ)

### 1. Start the Backend API
```bash
cd simple-rag-backend
./mvnw clean spring-boot:run
```
*(Runs on http://localhost:8080)*

### 2. Start the Document Worker
```bash
cd simple-rag-worker
./mvnw clean spring-boot:run
```
*(Runs on http://localhost:8081)*

### 3. Start the Client
```bash
cd simple-rag-client
pnpm install
pnpm run dev
```
*(Runs on the frontend port, usually http://localhost:5173 or 3000)*
