import { getFilteredCharacters } from '../client/rickandmorty/characterService';
import { hubspotClient } from '../client/hubspot/hubspotClient';
import { hubspotClientMirror } from '../client/hubspot/hubspotClientMirror';

function cleanProperties(properties: { [key: string]: string | null }): { [key: string]: string } {
  const cleaned: { [key: string]: string } = {};
  const readOnlyProps = ['createdate', 'hs_object_id', 'lastmodifieddate'];

  for (const key in properties) {
    const value = properties[key];
    if (value !== null && !readOnlyProps.includes(key)) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export async function createContactsFromCharacters() {
  const characters = await getFilteredCharacters();
  const results = [];

  for (const character of characters) {
    const properties = {
      firstname: character.name,
      email: `${character.name.replace(/\s/g, '').toLowerCase()}@example.com`
      // 🔴 'location' se ha eliminado porque no existe en HubSpot por defecto
    };

    const cleaned = cleanProperties(properties);

    try {
      // Crear en la cuenta MAIN
      const main = await hubspotClient.crm.contacts.basicApi.create({ properties: cleaned });

      // Crear también en la cuenta MIRROR
      const mirror = await hubspotClientMirror.crm.contacts.basicApi.create({ properties: cleaned });

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
  }

  return results;
}
