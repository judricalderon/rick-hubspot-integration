import { hubspotClient } from '../client/hubspot/hubspotClient';
import { hubspotClientMirror } from '../client/hubspot/hubspotClientMirror';
import { FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/contacts';

export const syncAssociationInMirror = async (
  fromObjectId: number,
  toObjectId: number
): Promise<void> => {
  console.log('🔍 Iniciando sincronización de asociación en mirror...');

  try {
    // 1. Obtener contacto en cuenta principal
    const contactMain = await hubspotClient.crm.contacts.basicApi.getById(
      fromObjectId.toString(),
      ['email']
    );
    const email = contactMain.properties?.email;
    if (!email) {
      console.warn(`⚠️ Contacto sin email, no se puede buscar en mirror.`);
      return;
    }
    console.log(`📧 Email del contacto (main): ${email}`);

    // 2. Buscar contacto en mirror por email
    const contactSearch = await hubspotClientMirror.crm.contacts.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'email',
              operator: FilterOperatorEnum.Eq,
              value: email
            }
          ]
        }
      ],
      properties: ['email'],
      limit: 1
    });

    const contactMirror = contactSearch.results[0];
    if (!contactMirror) {
      console.warn(`⚠️ Contacto con email ${email} no encontrado en mirror.`);
      return;
    }
    console.log(`✅ Contacto encontrado en mirror con ID: ${contactMirror.id}`);

    // 3. Obtener compañía en cuenta principal
    const companyMain = await hubspotClient.crm.companies.basicApi.getById(
      toObjectId.toString(),
      ['domain']
    );
    const domain = companyMain.properties?.domain;
    if (!domain) {
      console.warn(`⚠️ Compañía sin dominio, no se puede buscar en mirror.`);
      return;
    }
    console.log(`🌐 Dominio de la compañía (main): ${domain}`);

    // 4. Buscar compañía en mirror por dominio
    const companySearch = await hubspotClientMirror.crm.companies.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'domain',
              operator: FilterOperatorEnum.Eq,
              value: domain
            }
          ]
        }
      ],
      properties: ['domain'],
      limit: 1
    });

    const companyMirror = companySearch.results[0];
    if (!companyMirror) {
      console.warn(`⚠️ Compañía con dominio ${domain} no encontrada en mirror.`);
      return;
    }
    console.log(`✅ Compañía encontrada en mirror con ID: ${companyMirror.id}`);

    // 5. Asociar contacto a compañía en mirror usando apiRequest
    await hubspotClientMirror.apiRequest({
      method: 'POST',
      path: '/crm/v4/associations/companies/contacts/batch/associate/default',
      body: {
        inputs: [
          {
            from: { id: companyMirror.id },
            to: { id: contactMirror.id }
          }
        ]
      }
    });

    console.log('🔗 Asociación creada en mirror con éxito.');
  } catch (error) {
    console.error('❌ Error en syncAssociationInMirror:', error);
  }
};
