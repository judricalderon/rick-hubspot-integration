import express from 'express';
import dotenv from 'dotenv';
import { getFilteredCharacters } from './services/client/rickandmorty/character.service';
import { getAllContacts } from './services/client/hubspot/hubspot.service';
import { createContactsFromCharacters } from './services/internal/character.to.contact.service';
import { createCompaniesFromLocations } from './services/internal/location.to.company.service';
import { associateContactsToCompanies } from './services/internal/associate.contact.company.service';

dotenv.config(); // Carga las variables de entorno desde .env
const app = express(); // Se instancia la aplicación
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware para recibir JSON

// 🔹 Ruta de prueba para verificar que el servidor está corriendo
app.get('/', (_, res) => {
  res.send('🚀 Rick & HubSpot Integration API funcionando');
});

// 🔹 Obtener personajes filtrados (solo los de ID primo o 1)
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

// 🔹 Sincronizar personajes como contactos en HubSpot
app.get('/hubspot/sync/contacts', async (_, res) => {
  try {
    const result = await createContactsFromCharacters();
    res.json({ message: 'Contactos creados', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al sincronizar contactos' });
  }
});

// 🔹 Sincronizar ubicaciones como compañías en HubSpot
app.get('/hubspot/sync/companies', async (_, res) => {
  try {
    const result = await createCompaniesFromLocations();
    res.json({ message: 'Compañías creadas', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al sincronizar compañías' });
  }
});

// 🔹 Asociar contactos con compañías en HubSpot
app.get('/hubspot/sync/associations', async (_, res) => {
  try {
    const result = await associateContactsToCompanies();
    res.json({ message: 'Asociaciones completadas', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al asociar contactos y compañías' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
