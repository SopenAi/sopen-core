Sopen Core

Sopen Core is the backend engine for Sopen.ai — an AI-powered autonomous publishing & knowledge distribution system.
Sopen automatically analyzes, optimizes, and publishes content across digital platforms using AI-driven pipelines.

🚀 Vision

Build the world’s first fully automated knowledge publishing and content intelligence infrastructure.

🧠 Core Capabilities

AI-driven content orchestration

Multi-platform publishing pipeline

Distributed processing queue

User and workspace management

Authentication & API control layer

Real-time performance analytics

Cloud-based scalable architecture


📦 Tech Stack

Layer Tools

Runtime Node.js
Database MongoDB Atlas
Cache & Queue Redis + Message Queue
AI Multi-Model Layer (OpenAI + Internal models)
Hosting Google Cloud (Cloud Run, Cloud Functions, VPC)
CDN Cloudflare
CI/CD GitHub Actions



---

📂 Folder Structure (Live Project)

sopen-core/
 ├─ ai/
 ├─ config/
 ├─ database/
 ├─ logs/
 ├─ node_modules/
 ├─ publisher/
 ├─ queue/
 ├─ routes/
 ├─ utils/
 ├─ website/
 ├─ worker/
 ├─ .env.template
 ├─ package.json
 ├─ package-lock.json
 ├─ README.md
 └─ server.js


---

🔐 Environment Setup

Rename .env.template → .env and fill keys:

PORT=8080
JWT_SECRET=your_secret
MONGO_URI=...
REDIS_URL=...
CLOUD_API=...


---

🧪 Running Locally

npm install
npm start


---

🏗️ Deployment

Google Cloud Run

gcloud run deploy sopen-core \
--source . \
--region europe-west1 \
--allow-unauthenticated


---

📜 License

Proprietary — All rights reserved.
Contact: info@sopen.ai


---

🤝 Collaboration

If you are interested in partnerships, investment, or engineering collaboration:

📧  info@sopen.ai
🌐  https://sopen.ai


---

⭐ Support the Mission

Star the repo ⭐ to follow the evolution of autonomous AI publishing systems.
