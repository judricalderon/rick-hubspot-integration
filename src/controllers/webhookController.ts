import { Request, Response } from 'express';
import { hubspotClient } from '../services/client/hubspot/hubspotClient';
import { hubspotClientMirror } from '../services/client/hubspot/hubspotClientMirror';
import { cleanProperties } from './syncController'; // Asegúrate que esté exportada
import { syncAssociationInMirror } from '../services/internal/syncAssociationInMirror'; // opcional: si ya la tienes

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
  'creation_date',
  'domain'
];

export const webhookHandler = async (req: Request, res: Response) => {
  const events = req.body;
  console.log('📨 Webhook recibido:', JSON.stringify(events, null, 2));

  try {
    for (const event of events) {
      const { subscriptionType, objectId } = event;

      if (subscriptionType === 'contact.creation') {
        console.log(`👤 Evento: Creación de contacto (${objectId})`);

        const contact = await hubspotClient.crm.contacts.basicApi.getById(String(objectId), CONTACT_FIELDS);
        console.log('📥 Contacto original:', contact.properties);

        const cleaned = cleanProperties(contact.properties, CONTACT_FIELDS);
        console.log('🧼 Contacto limpiado:', cleaned);

        await hubspotClientMirror.crm.contacts.basicApi.create({ properties: cleaned });
        console.log('✅ Contacto replicado en mirror.');

      } else if (subscriptionType === 'company.creation') {
        console.log(`🏢 Evento: Creación de compañía (${objectId})`);

        const company = await hubspotClient.crm.companies.basicApi.getById(String(objectId), COMPANY_FIELDS);
        console.log('📥 Compañía original:', company.properties);

        const cleaned = cleanProperties(company.properties, COMPANY_FIELDS);
        console.log('🧼 Compañía limpiada:', cleaned);

        await hubspotClientMirror.crm.companies.basicApi.create({ properties: cleaned });
        console.log('✅ Compañía replicada en mirror.');

      } else if (subscriptionType === 'contact.associationChange') {
        const {
          associationType,
          associationRemoved,
          fromObjectId,
          toObjectId
        } = event;

        console.log(`🔗 Evento: Cambio de asociación`);
        console.log(`🧩 associationType: ${associationType}`);
        console.log(`🔄 associationRemoved: ${associationRemoved}`);
        console.log(`📎 fromObjectId (contact): ${fromObjectId}`);
        console.log(`🏢 toObjectId (company): ${toObjectId}`);

        if (associationType === 'CONTACT_TO_COMPANY' && !associationRemoved) {
          console.log('🟢 Asociación contacto → compañía detectada (no eliminada).');
          await syncAssociationInMirror(Number(fromObjectId), Number(toObjectId));
        } else if (associationType === 'CONTACT_TO_COMPANY' && associationRemoved) {
          console.log('🔴 Asociación contacto → compañía eliminada.');
          // Aquí podrías implementar lógica para desasociar en mirror si se desea
        }
      }
    }

    res.status(200).send('✅ Webhook procesado');
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(500).send('Error al procesar el webhook');
  }
};
