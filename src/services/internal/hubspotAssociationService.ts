import { hubspotClient } from '../client/hubspot/hubspotClient';

/**
 * Asocia un contacto con una compañía en HubSpot, usando la relación company_to_contact
 * @param contactId ID del contacto en HubSpot
 * @param companyId ID de la compañía en HubSpot
 */
export async function associateContactToCompany(contactId: string, companyId: string) {
  const body = {
    inputs: [
      {
        from: { id: companyId },
        to: { id: contactId },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: 1
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
