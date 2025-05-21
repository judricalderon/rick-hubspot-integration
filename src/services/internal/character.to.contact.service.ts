import { getFilteredCharacters } from '../client/rickandmorty/character.service';
import { createContact } from '../client/hubspot/hubspot.service';

export async function createContactsFromCharacters() {
  const characters = await getFilteredCharacters();
  const results = [];

  for (const char of characters) {
    const random = Math.floor(Math.random() * 1000);
    const email = `${char.name.toLowerCase().replace(/\s/g, '')}${random}@rickverse.com`;

     try {
      const response = await createContact(char.name, char.species, email);
      results.push({ name: char.name, status: 'created' });
    } catch (error) {
      let errorMessage = 'Unknown error';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error && 'body' in error) {
        errorMessage = (error as any).body?.message || 'Unknown error';
      }

      results.push({ name: char.name, status: 'error', error: errorMessage });
    }
  }

  return results;
}