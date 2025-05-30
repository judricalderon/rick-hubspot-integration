import { Request, Response } from 'express';
import { hubspotClient } from '../services/client/hubspot/hubspotClient';
import { hubspotClientMirror } from '../services/client/hubspot/hubspotClientMirror';
import { cleanProperties } from './syncController'; // Asegúrate que cleanProperties esté exportada

const CONTACT_FIELDS = [
  'firstname',
  'lastname',
  'email',
  'character_id',
  'character_species',
  'status_character',
  'character_gender'
];

const COMPANY_FIELDS = [
  'name',
  'location_id',
  'location_type',
  'dimension',
  'creation_date'
];

export const webhookHandler = async (req: Request, res: Response) => {
  const events = req.body;
  console.log('📨 Webhook recibido:', JSON.stringify(events, null, 2));

  try {
    for (const event of events) {
      const { subscriptionType, objectId } = event;

      if (subscriptionType === 'contact.creation') {
        const contact = await hubspotClient.crm.contacts.basicApi.getById(objectId, CONTACT_FIELDS);
        const cleaned = cleanProperties(contact.properties, CONTACT_FIELDS);
        await hubspotClientMirror.crm.contacts.basicApi.create({ properties: cleaned });

      } else if (subscriptionType === 'company.creation') {
        const company = await hubspotClient.crm.companies.basicApi.getById(objectId, COMPANY_FIELDS);
        const cleaned = cleanProperties(company.properties, COMPANY_FIELDS);
        await hubspotClientMirror.crm.companies.basicApi.create({ properties: cleaned });
      }
    }

    res.status(200).send('✅ Webhook procesado');
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(500).send('Error al procesar el webhook');
  }
};
