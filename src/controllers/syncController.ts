import { Request, Response } from 'express';
import { hubspotClient } from '../services/client/hubspot/hubspotClient';
import { hubspotClientMirror } from '../services/client/hubspot/hubspotClientMirror';
import { syncAllContactsFromMainToMirror } from '../services/internal/syncAllContactsService';
import { syncAllCompaniesFromMainToMirror } from '../services/internal/syncAllCompaniesService';

/* 🔹 Utilidades de limpieza */

const CONTACT_ALLOWED_FIELDS = [
  'firstname', 'lastname', 'email',
  'character_id', 'character_species',
  'status_character', 'character_gender'
];

const COMPANY_ALLOWED_FIELDS = [
  'name', 'location_id', 'location_type',
  'dimension', 'creation_date'
];

export function cleanProperties(
  properties: { [key: string]: string | null },
  allowedFields: string[]
): { [key: string]: string } {
  const cleaned: { [key: string]: string } = {};
  const readOnly = ['createdate', 'hs_object_id', 'lastmodifieddate'];

  for (const key in properties) {
    const value = properties[key];
    if (value !== null && allowedFields.includes(key) && !readOnly.includes(key)) {
      cleaned[key] = value;
    }
  }

  return cleaned;
}
/* 🔸 Endpoints individuales de sincronización */

export const syncContact = async (req: Request, res: Response) => {
  try {
    const contactId = req.body.contactId;
    const contact = await hubspotClient.crm.contacts.basicApi.getById(contactId);
    const cleanedProperties = cleanProperties(contact.properties, CONTACT_ALLOWED_FIELDS);

    res.status(200).json({
      message: 'Contacto obtenido correctamente (esperando que el webhook lo replique)',
      data: cleanedProperties
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener contacto', error: error.message });
  }
};

export const syncCompany = async (req: Request, res: Response) => {
  try {
    const companyId = req.body.companyId;
    const company = await hubspotClient.crm.companies.basicApi.getById(companyId);
    const cleanedProperties = cleanProperties(company.properties, COMPANY_ALLOWED_FIELDS);

    res.status(200).json({
      message: 'Compañía obtenida correctamente (esperando que el webhook la replique)',
      data: cleanedProperties
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener compañía', error: error.message });
  }
};

/* 🔁 Endpoints de sincronización masiva */

export const syncAllContacts = async (req: Request, res: Response) => {
  try {
    const result = await syncAllContactsFromMainToMirror();
    res.status(200).json({ message: 'Contactos sincronizados en masa', data: result });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al sincronizar todos los contactos', error: error.message });
  }
};

export const syncAllCompanies = async (req: Request, res: Response) => {
  try {
    const result = await syncAllCompaniesFromMainToMirror();
    res.status(200).json({
      message: 'Compañías sincronizadas en masa',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al sincronizar todas las compañías',
      error: error.message
    });
  }
};

/* 🔂 Webhook de HubSpot para replicación automática */

export const handleWebhook = async (req: Request, res: Response) => {
  const events = req.body;
  console.log('📨 Webhook recibido:', JSON.stringify(events, null, 2));

  try {
    for (const event of events) {
      const { subscriptionType, objectId } = event;

      if (subscriptionType === 'contact.creation') {
        const contact = await hubspotClient.crm.contacts.basicApi.getById(objectId);
        const cleaned = cleanProperties(contact.properties, CONTACT_ALLOWED_FIELDS);
        await hubspotClientMirror.crm.contacts.basicApi.create({ properties: cleaned });

      } else if (subscriptionType === 'company.creation') {
        const company = await hubspotClient.crm.companies.basicApi.getById(objectId);
        const cleaned = cleanProperties(company.properties, COMPANY_ALLOWED_FIELDS);
        await hubspotClientMirror.crm.companies.basicApi.create({ properties: cleaned });
      }
    }

    res.status(200).send('✅ Webhook procesado');
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(500).send('Error al procesar el webhook');
  }
};
