import { hubspotClient } from '../client/hubspot/hubspotClient';
import { hubspotClientMirror } from '../client/hubspot/hubspotClientMirror';
import { SimplePublicObject } from '@hubspot/api-client/lib/codegen/crm/contacts';

function cleanProperties(properties: { [key: string]: string | null }): { [key: string]: string } {
  const cleaned: { [key: string]: string } = {};
  const readOnlyFields = ['createdate', 'hs_object_id', 'lastmodifieddate'];

  for (const key in properties) {
    const value = properties[key];
    if (value !== null && !readOnlyFields.includes(key)) {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

export async function syncAllContactsFromMainToMirror() {
  const results: any[] = [];

  try {
    const response = await hubspotClient.crm.contacts.basicApi.getPage(100);
    const contacts: SimplePublicObject[] = response.results;

    for (const contact of contacts) {
      const cleaned = cleanProperties(contact.properties);
      try {
        const created = await hubspotClientMirror.crm.contacts.basicApi.create({ properties: cleaned });
        results.push({ id: contact.id, status: 'synced', mirrorId: created.id });
      } catch (err: any) {
        results.push({ id: contact.id, status: 'error', error: err.message });
      }
    }

    return results;
  } catch (error: any) {
    console.error('💥 Error al obtener contactos:', error.message);
    throw new Error('Error al sincronizar contactos');
  }
}
