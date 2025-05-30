import express from 'express';
import dotenv from 'dotenv';

import syncRoutes from './routes/syncRoutes';
import { webhookHandler } from './controllers/webhookController'; // Webhook separado

import { getAllContacts, deleteAllContacts } from './services/client/hubspot/hubspotService';
import { createContactsFromCharacters } from './services/internal/characterToContactService';
import { createCompaniesFromLocations } from './services/internal/locationToCompanyService';
import { associateContactsToCompanies } from './services/internal/associateContactCompanyService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 🔁 Webhook principal (se recomienda mover a /webhook si se desea aislar)
app.post('/', webhookHandler);

// 🔄 Rutas organizadas por dominio funcional
app.use('/sync', syncRoutes);

app.get('/', (_, res) => {
  res.send('🚀 Rick & HubSpot Integration API funcionando');
});

// 🔍 Obtener todos los contactos desde la cuenta principal
app.get('/hubspot/contacts', async (_, res) => {
  try {
    const contacts = await getAllContacts();
    res.json(contacts);
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    res.status(500).json({ error: 'HubSpot API error' });
  }
});

// 🔄 Sincronización manual desde personajes y ubicaciones
app.get('/hubspot/sync/contacts', async (_, res) => {
  try {
    const result = await createContactsFromCharacters();
    res.json({ message: 'Contactos creados', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al sincronizar contactos' });
  }
});

app.get('/hubspot/sync/companies', async (_, res) => {
  try {
    const result = await createCompaniesFromLocations();
    res.json({ message: 'Compañías creadas', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al sincronizar compañías' });
  }
});

app.get('/hubspot/sync/associations', async (_, res) => {
  try {
    const result = await associateContactsToCompanies();
    res.json({ message: 'Asociaciones completadas', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al asociar contactos y compañías' });
  }
});

// ❌ Eliminar todos los contactos (uso limitado para pruebas)
app.delete('/hubspot/delete/contacts', async (_, res) => {
  try {
    const result = await deleteAllContacts();
    res.json({ message: 'Contactos eliminados', data: result });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar contactos' });
  }
});

// 🚀 Lanzar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
