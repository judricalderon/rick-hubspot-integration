import { getFilteredCharacters } from '../client/rickandmorty/characterService';
import { hubspotClient } from '../client/hubspot/hubspotClient';
import { hubspotClientMirror } from '../client/hubspot/hubspotClientMirror';

export async function createContactsFromCharacters() {
  const characters = await getFilteredCharacters();
  const results = [];
  let count = 1;

  for (const character of characters) {
    // Separar nombre en firstname y lastname
    const nameParts = character.name.trim().split(' ');
    const [firstname, ...lastnameParts] = character.name.trim().split(' ');
    const lastname = lastnameParts.join(' ');

    // Normalizar status y gender con valores válidos
    const status = ['Alive', 'Dead', 'unknown'].includes(character.status) ? character.status : 'unknown';
    const gender = ['Female', 'Male', 'Genderless', 'unknown'].includes(character.gender) ? character.gender : 'unknown';

    const properties = {
      character_id: character.id.toString(),
      firstname,
      lastname,
      status_character: status,
      character_species: character.species,
      character_gender: gender,
      email: `${character.name.replace(/\s/g, '').toLowerCase()}@example.com`
    };

    console.log(`📤 ${count}. Enviando contacto ${character.name} con propiedades:`, properties);

    try {
      // Crear en la cuenta MAIN
      const main = await hubspotClient.crm.contacts.basicApi.create({ properties });

      // Crear también en la cuenta MIRROR
      const mirror = await hubspotClientMirror.crm.contacts.basicApi.create({ properties });

      results.push({
        name: character.name,
        mainId: main.id,
        mirrorId: mirror.id,
        status: 'synced'
      });
    } catch (error: any) {
      results.push({
        name: character.name,
        status: 'error',
        error: error.message
      });
    }

    count++;
  }

  return results;
}

