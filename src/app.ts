import express from 'express';
import dotenv from 'dotenv';

import syncRoutes from './routes/syncRoutes';
import { getFilteredCharacters } from './services/client/rickandmorty/characterService';
import { getAllContacts, deleteAllContacts } from './services/client/hubspot/hubspotService';
import { createContactsFromCharacters } from './services/internal/characterToContactService';
import { createCompaniesFromLocations } from './services/internal/locationToCompanyService';
import { associateContactsToCompanies } from './services/internal/associateContactCompanyService';

import { hubspotClient } from './services/client/hubspot/hubspotClient';
import { hubspotClientMirror } from './services/client/hubspot/hubspotClientMirror';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rutas de sincronización externa
app.use('/sync', syncRoutes);

// 🔹 Ruta base (GET)
app.get('/', (_, res) => {
  res.send('🚀 Rick & HubSpot Integration API funcionando');
});

// 🔹 Endpoint para webhooks (POST)
app.post('/', async (req, res) => {
  const events = req.body;

  console.log('📨 Webhook recibido:', JSON.stringify(events, null, 2));

  const readOnlyFields = ['createdate', 'hs_object_id', 'lastmodifieddate'];

  function cleanProperties(properties: { [key: string]: string | null }): { [key: string]: string } {
    const cleaned: { [key: string]: string } = {};
    for (const key in properties) {
      const value = properties[key];
      if (value !== null && !readOnlyFields.includes(key)) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  try {
    for (const event of events) {
      const { subscriptionType, objectId } = event;

      if (subscriptionType === 'contact.creation') {
        const contact = await hubspotClient.crm.contacts.basicApi.getById(objectId);
        const cleaned = cleanProperties(contact.properties);
        await hubspotClientMirror.crm.contacts.basicApi.create({ properties: cleaned });

      } else if (subscriptionType === 'company.creation') {
        const company = await hubspotClient.crm.companies.basicApi.getById(objectId);
        const cleaned = cleanProperties(company.properties);
        await hubspotClientMirror.crm.companies.basicApi.create({ properties: cleaned });
      }
    }

    res.status(200).send('✅ Webhook procesado');
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(500).send('Error al procesar el webhook');
  }
});

// 🔹 Obtener personajes filtrados (solo IDs primos o 1)
app.get('/characters', async (_, res) => {
  try {
    const characters = await getFilteredCharacters();
    res.json(characters);
  } catch (error) {
    console.error('Error al obtener personajes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🔹 Obtener contactos existentes en HubSpot
app.get('/hubspot/contacts', async (_, res) => {
  try {
    const contacts = await getAllContacts();
    res.json(contacts);
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    res.status(500).json({ error: 'HubSpot API error' });
  }
});

// 🔹 Crear contactos a partir de personajes
app.get('/hubspot/sync/contacts', async (_, res) => {
  try {
    const result = await createContactsFromCharacters();
    res.json({ message: 'Contactos creados', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al sincronizar contactos' });
  }
});

// 🔹 Crear compañías a partir de ubicaciones
app.get('/hubspot/sync/companies', async (_, res) => {
  try {
    const result = await createCompaniesFromLocations();
    res.json({ message: 'Compañías creadas', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al sincronizar compañías' });
  }
});

// 🔹 Asociar contactos con compañías
app.get('/hubspot/sync/associations', async (_, res) => {
  try {
    const result = await associateContactsToCompanies();
    res.json({ message: 'Asociaciones completadas', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al asociar contactos y compañías' });
  }
});

// 🔹 Eliminar todos los contactos
app.delete('/hubspot/delete/contacts', async (_, res) => {
  try {
    const result = await deleteAllContacts();
    res.json({ message: 'Contactos eliminados', data: result });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar contactos' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
