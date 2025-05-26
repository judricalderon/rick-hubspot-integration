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

### 🔄 2. **Integration**
- Listens for webhook events (e.g., `contact.creation`, `company.creation`) from the source account.
- Automatically **replicates contacts and companies** in the **mirror HubSpot account** in real time.

---

## 🛠️ Tech Stack

- **Node.js** with **Express**
- **TypeScript**
- **HubSpot Node.js SDK**
- **Rick and Morty REST API**
- **Render.com** for deployment
- **dotenv** for managing environment variables

---

## 🚀 Endpoints

| Method | Endpoint                             | Description                                      |
|--------|--------------------------------------|--------------------------------------------------|
| `GET`  | `/`                                  | Health check route                              |
| `POST` | `/`                                  | Receives webhook events from HubSpot            |
| `GET`  | `/characters`                        | Returns filtered characters (prime ID or 1)     |
| `GET`  | `/hubspot/sync/contacts`             | Migrates contacts to HubSpot                    |
| `GET`  | `/hubspot/sync/companies`            | Migrates companies to HubSpot                   |
| `GET`  | `/hubspot/sync/associations`         | Associates contacts to their companies          |
| `GET`  | `/hubspot/contacts`                  | Fetches existing HubSpot contacts               |
| `DELETE` | `/hubspot/delete/contacts`         | Deletes all contacts from HubSpot (source)      |

---

## ⚙️ Environment Variables

Create a `.env` file with the following content:

```env
HUBSPOT_TOKEN=your_source_account_token
HUBSPOT_MIRROR_TOKEN=your_mirror_account_token
```
🧪 How to Run Locally

1. Clone the repository:

git clone https://github.com/judricalderon/rick-hubspot-integration.git
cd rick-hubspot-integration


2. Install dependencies:

npm install

3. Set up your environment variables in .env.

4. Run the app:

npm run dev



🌐 Deployment
The project is deployed using Render and accessible at:

🔗 https://rick-hubspot-integration.onrender.com/

Every push to the main branch triggers an automatic deployment.


🔔 Webhooks
Webhooks are managed through the App Subscription system in HubSpot (Private App):

contact.creation

company.creation

When a contact or company is created in the source account, an event is sent to the API, which then replicates the data in the mirror account.



🧠 Diagram


[Rick and Morty API]
         ↓
[Migration Script] → [HubSpot Source (Contacts + Companies)]
                                 ↓
                             Webhooks
                                 ↓
           [Your API on Render] → [HubSpot Mirror (Replication)]




🧑‍💻 Author
Juan David Rivera Calderón
💼 GitHub: judricalderon


✅ Status
✅ Migration complete
✅ Webhooks configured
✅ API deployed and responding
✅ Ready for review and delivery 🎉








