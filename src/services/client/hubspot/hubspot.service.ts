import { hubspotClient } from './hubspot.client';

export async function createCompany(name: string, description: string) {
  return await hubspotClient.crm.companies.basicApi.create({
    properties: {
      name,
      description,
    },
  });
}

export async function getAllContacts(limit: number = 10) {
  const response = await hubspotClient.crm.contacts.basicApi.getPage(limit, undefined, undefined);
  return response.results;
}

export async function createContact(firstname: string, lastname: string, email: string) {
  const response = await hubspotClient.crm.contacts.basicApi.create({
    properties: { firstname, lastname, email },
  });
  return response;
}
export async function getAllCompanies() {
  const response = await hubspotClient.crm.companies.basicApi.getPage(100);
  return response.results;
}

export async function associateContactToCompany(contactId: string, companyId: string) {
  return await hubspotClient.crm.companies.associationsApi.create(
    companyId,
    'contacts',
    contactId,
    ['company_to_contact']
  );
}