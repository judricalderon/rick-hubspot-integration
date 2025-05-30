import express from 'express';
import {
  syncContact,
  syncCompany,
  syncAllContacts,
  syncAllCompanies,
  handleWebhook
} from '../controllers/syncController';

const router = express.Router();

// 🔁 Webhook: replica contactos y compañías desde cuenta principal a mirror
router.post('/', handleWebhook);

// 🔹 Sincronización individual
router.post('/contact', syncContact);
router.post('/company', syncCompany);

// 🔸 Sincronización masiva
router.post('/contacts/sync-all', syncAllContacts);
router.post('/companies/sync-all', syncAllCompanies);

export default router;
