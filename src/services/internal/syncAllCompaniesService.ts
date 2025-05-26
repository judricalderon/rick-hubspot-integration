import { hubspotClient } from '../client/hubspot/hubspotClient';
import { hubspotClientMirror } from '../client/hubspot/hubspotClientMirror';
import { SimplePublicObject } from '@hubspot/api-client/lib/codegen/crm/companies';

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

export async function syncAllCompaniesFromMainToMirror() {
  const results: any[] = [];

  try {
    const response = await hubspotClient.crm.companies.basicApi.getPage(100);
    const companies: SimplePublicObject[] = response.results;

    for (const company of companies) {
      const cleaned = cleanProperties(company.properties);
      try {
        const created = await hubspotClientMirror.crm.companies.basicApi.create({ properties: cleaned });
        results.push({ id: company.id, status: 'synced', mirrorId: created.id });
      } catch (err: any) {
        results.push({ id: company.id, status: 'error', error: err.message });
      }
    }

    return results;
  } catch (error: any) {
    console.error('💥 Error al obtener compañías:', error.message);
    throw new Error('Error al sincronizar compañías');
  }
}
