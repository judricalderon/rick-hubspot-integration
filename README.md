# Rick & HubSpot Integration API

🚀 Backend project that integrates the [Rick and Morty API](https://rickandmortyapi.com/) with two HubSpot CRM accounts (source and mirror) using both a **migration** and a **real-time integration** via webhooks.

---

## 📌 Project Overview

This project is divided into two main parts:

### ✅ 1. **Migration**
- Fetches all characters whose ID is a prime number or equal to 1 from the Rick and Morty API.
- Creates each character as a **Contact** in the **source HubSpot account**.
- Creates each character’s location as a **Company**.
- Establishes the association between the Contact and its corresponding Company.
- Synchronizes all contacts and companies from the source account to the mirror account using batch operations.

### 🔄 2. **Integration**
- Listens for webhook events (e.g., `contact.creation`, `company.creation`) from the source account.
- Automatically **replicates contacts and companies** in the **mirror HubSpot account** in real time.

---

## 🛠️ Tech Stack

- **Node.js** with **Express**
- **TypeScript**
- **HubSpot Node.js SDK**
- **Rick and Morty REST API**
- **Jest** for testing
- **ts-node-dev** for local development
- **Render.com** for deployment
- **dotenv** for managing environment variables

---

## 🚀 Endpoints

| Method   | Endpoint                             | Description                                      |
|----------|--------------------------------------|--------------------------------------------------|
| `GET`    | `/`                                  | Health check route                               |
| `POST`   | `/`                                  | Receives webhook events from HubSpot             |
| `GET`    | `/characters`                        | Returns filtered characters (prime ID or 1)      |
| `GET`    | `/hubspot/sync/contacts`             | Migrates contacts to HubSpot                     |
| `GET`    | `/hubspot/sync/companies`            | Migrates companies to HubSpot                    |
| `GET`    | `/hubspot/sync/associations`         | Associates contacts to their companies           |
| `GET`    | `/hubspot/contacts`                  | Fetches existing HubSpot contacts                |

---

## ⚙️ Environment Variables

Create a `.env` file with the following content:

```env
HUBSPOT_TOKEN=your_source_account_token
HUBSPOT_MIRROR_TOKEN=your_mirror_account_token
