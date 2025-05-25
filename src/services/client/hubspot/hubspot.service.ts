import { hubspotClient } from './hubspot.client';

// 🔹 Crear una compañía
export async function createCompany(name: string, description: string) {
  return await hubspotClient.crm.companies.basicApi.create({
    properties: {
      name,
      description,
    },
  });
}

// 🔹 Obtener todos los contactos
export async function getAllContacts(limit: number = 10) {
  const response = await hubspotClient.crm.contacts.basicApi.getPage(limit);
  return response.results;
}

// 🔹 Crear un contacto
export async function createContact(firstname: string, lastname: string, email: string) {
  const response = await hubspotClient.crm.contacts.basicApi.create({
    properties: { firstname, lastname, email },
  });
  return response;
}

// 🔹 Obtener todas las compañías
export async function getAllCompanies() {
  const response = await hubspotClient.crm.companies.basicApi.getPage(100);
  return response.results;
}

// 🔹 Asociar un contacto a una compañía (vía API REST)
export async function associateContactToCompany(contactId: string, companyId: string) {
  const body = {
    inputs: [
      {
        from: { id: companyId },
        to: { id: contactId },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: 1 // 🔗 company_to_contact
          }
        ]
      }
    ]
  };

  return await hubspotClient.apiRequest({
    method: 'POST',
    path: '/crm/v4/associations/companies/contacts/batch/create',
    body
  });
}
