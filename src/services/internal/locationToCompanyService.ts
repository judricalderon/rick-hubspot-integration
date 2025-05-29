import axios from 'axios';
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

export async function createCompaniesFromLocations() {
  const characters = await getFilteredCharacters();
  const uniqueUrls = Array.from(
    new Set(characters.map(c => c.location?.url).filter(url => url && url !== ''))
  );

  const results: any[] = [];
  let count = 1;

  for (const url of uniqueUrls) {
    try {
      const { data: location } = await axios.get(url);

      const properties = {
        location_id: location.id.toString(),
        name: location.name || '',
        location_type: location.type || '',
        dimension: location.dimension || '',
        creation_date: location.created
          ? new Date(location.created).toISOString().split('T')[0]
          : ''
      };

      console.log(`🏢 ${count}. Enviando compañía "${location.name}" con propiedades:`, properties);

      const cleaned = cleanProperties(properties);

      const main = await hubspotClient.crm.companies.basicApi.create({ properties: cleaned });
      const mirror = await hubspotClientMirror.crm.companies.basicApi.create({ properties: cleaned });

      results.push({
        location: location.name,
        mainId: main.id,
        mirrorId: mirror.id,
        status: 'synced'
      });

      count++;
    } catch (error: any) {
      console.error(`❌ Error al procesar ubicación desde ${url}:`, error.message);
      results.push({
        locationUrl: url,
        status: 'error',
        error: error.message
      });
    }
  }

  console.log(`✅ Total de compañías sincronizadas: ${count - 1}`);
  return results;
}
