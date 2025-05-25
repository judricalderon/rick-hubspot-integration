import { hubspotClient } from './hubspot.client';

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
