import { getFilteredCharacters } from '../client/rickandmorty/characterService';
import { hubspotClient } from '../client/hubspot/hubspotClient';
import { hubspotClientMirror } from '../client/hubspot/hubspotClientMirror';

function cleanProperties(properties: { [key: string]: string | null }): { [key: string]: string } {
  const cleaned: { [key: string]: string } = {};
  const readOnly = ['createdate', 'hs_object_id', 'lastmodifieddate'];
  for (const key in properties) {
    if (properties[key] !== null && !readOnly.includes(key)) {
      cleaned[key] = properties[key]!;
    }
  }
  return cleaned;
}

export async function createCompaniesFromLocations() {
  const characters = await getFilteredCharacters();
  const uniqueLocations = Array.from(
    new Set(characters.map(c => c.location?.name?.toLowerCase()).filter(l => l && l !== 'unknown'))
  );

  const results: any[] = [];

  for (const location of uniqueLocations) {
    const properties = { name: location! };
    const cleaned = cleanProperties(properties);

    try {
      const main = await hubspotClient.crm.companies.basicApi.create({ properties: cleaned });
      const mirror = await hubspotClientMirror.crm.companies.basicApi.create({ properties: cleaned });

      results.push({
        location,
        mainId: main.id,
        mirrorId: mirror.id,
        status: 'synced'
      });
    } catch (error: any) {
      results.push({
        location,
        status: 'error',
        error: error.message
      });
    }
  }

  return results;
}
