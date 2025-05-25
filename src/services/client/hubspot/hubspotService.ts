import { hubspotClient } from './hubspotClient';
import { SimplePublicObject } from '@hubspot/api-client/lib/codegen/crm/companies';
import { SimplePublicObject as ContactObject } from '@hubspot/api-client/lib/codegen/crm/contacts';

// 🔹 Crear una compañía en HubSpot
export async function createCompany(name: string, description: string): Promise<SimplePublicObject> {
  return await hubspotClient.crm.companies.basicApi.create({
    properties: {
      name,
      description,
    },
  });
}

// 🔹 Obtener todos los contactos
export async function getAllContacts(limit: number = 100): Promise<ContactObject[]> {
  const response = await hubspotClient.crm.contacts.basicApi.getPage(limit);
  return response.results;
}

// 🔹 Crear un contacto en HubSpot
export async function createContact(firstname: string, lastname: string, email: string): Promise<ContactObject> {
  return await hubspotClient.crm.contacts.basicApi.create({
    properties: {
      firstname,
      lastname,
      email,
    },
  });

  
}

// 🔹 Obtener todas las compañías
export async function getAllCompanies(): Promise<SimplePublicObject[]> {
  const response = await hubspotClient.crm.companies.basicApi.getPage(100);
  return response.results;
}

// 🔹 Asociar un contacto a una compañía usando el endpoint REST
export async function associateContactToCompany(contactId: string, companyId: string): Promise<any> {
  const body = {
    inputs: [
      {
        from: { id: companyId },
        to: { id: contactId },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: 1 // 👈 company_to_contact
          }
        ]
      }
    ]
  };

  return await hubspotClient.apiRequest({
  method: 'POST',
  path: '/crm/v4/associations/companies/contacts/batch/associate/default',
  body: {
    inputs: [
      {
        from: { id: companyId },
        to: { id: contactId },
      },
    ],
  },
});
}
export async function deleteAllContacts() {
  const contacts = await hubspotClient.crm.contacts.basicApi.getPage(100); // Ajusta el límite si tienes más
  const results = [];

  for (const contact of contacts.results) {
    try {
      await hubspotClient.crm.contacts.basicApi.archive(contact.id);
      results.push({ id: contact.id, status: 'deleted' });
    } catch (error: any) {
      results.push({ id: contact.id, status: 'error', error: error.message || 'Unknown error' });
    }
  }

  return results;
}