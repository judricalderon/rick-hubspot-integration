import { Request, Response } from 'express';
import { hubspotClient } from '../services/client/hubspot/hubspotClient';
import { syncAllContactsFromMainToMirror } from '../services/internal/syncAllContactsService';
import { syncAllCompaniesFromMainToMirror } from '../services/internal/syncAllCompaniesService';

function cleanProperties(properties: { [key: string]: string | null }): { [key: string]: string } {
  const allowedProperties = [
    'firstname',
    'lastname',
    'email',
    'character_id',
    'character_species',
    'status_character',
    'character_gender'
  ];

  const cleaned: { [key: string]: string } = {};
  for (const key in properties) {
    const value = properties[key];
    if (value !== null && allowedProperties.includes(key)) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// 🔹 Ahora solo consulta al main. El webhook replicará en mirror.
export const syncContact = async (req: Request, res: Response) => {
  try {
    const contactId = req.body.contactId;
    const contact = await hubspotClient.crm.contacts.basicApi.getById(contactId);
    const cleanedProperties = cleanProperties(contact.properties);

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
    const cleanedProperties = cleanProperties(company.properties);

    res.status(200).json({
      message: 'Compañía obtenida correctamente (esperando que el webhook la replique)',
      data: cleanedProperties
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener compañía', error: error.message });
  }
};

// 🔸 Esta parte sigue igual si aún quieres hacer sincronización masiva
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
