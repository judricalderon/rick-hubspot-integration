import express from 'express';
import dotenv from 'dotenv';
import { getFilteredCharacters } from './services/internal/character.service';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_, res) => {
  res.send('🚀 Rick & HubSpot Integration API funcionando');
});

app.get('/characters', async (_, res) => {
  try {
    const characters = await getFilteredCharacters();
    res.json(characters);
  } catch (error) {
    console.error('Error al obtener personajes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
