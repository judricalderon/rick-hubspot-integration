import { Request, Response } from 'express';
import { hubspotClient } from '../services/client/hubspot/hubspotClient';
import { hubspotClientMirror } from '../services/client/hubspot/hubspotClientMirror';
import { syncAllContactsFromMainToMirror } from '../services/internal/syncAllContactsService';
import { syncAllCompaniesFromMainToMirror } from '../services/internal/syncAllCompaniesService';



function cleanProperties(properties: { [key: string]: string | null }): { [key: string]: string } {
  const cleaned: { [key: string]: string } = {};
  const readOnlyProps = ['createdate', 'hs_object_id', 'lastmodifieddate'];

  for (const key in properties) {
    const value = properties[key];
    if (value !== null && !readOnlyProps.includes(key)) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export const syncContact = async (req: Request, res: Response) => {
  try {
    const contactId = req.body.contactId;
    const contact = await hubspotClient.crm.contacts.basicApi.getById(contactId);
    const cleanedProperties = cleanProperties(contact.properties);
    const created = await hubspotClientMirror.crm.contacts.basicApi.create({ properties: cleanedProperties });

    res.status(201).json({ message: 'Contacto sincronizado correctamente', data: created });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al sincronizar contacto', error: error.message });
  }
};

export const syncCompany = async (req: Request, res: Response) => {
  try {
    const companyId = req.body.companyId;
    const company = await hubspotClient.crm.companies.basicApi.getById(companyId);
    const cleanedProperties = cleanProperties(company.properties);
    const created = await hubspotClientMirror.crm.companies.basicApi.create({ properties: cleanedProperties });

    res.status(201).json({ message: 'Compañía sincronizada correctamente', data: created });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al sincronizar compañía', error: error.message });
  }
};

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

