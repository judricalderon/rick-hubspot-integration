import express from 'express';
import { syncContact, syncCompany } from '../controllers/syncController';
import { syncAllContacts } from '../controllers/syncController';

const router = express.Router();

router.post('/contact', syncContact);
router.post('/company', syncCompany);
router.post('/contacts/sync-all', syncAllContacts);

export default router;