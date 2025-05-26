import { Request, Response } from 'express';
import { hubspotClient } from '../services/client/hubspot/hubspotClient';
import { hubspotClientMirror } from '../services/client/hubspot/hubspotClientMirror';

export async function syncCompany(req: Request, res: Response) {
  try {
    const companyIdMain = req.body.companyId;

    // Obtener la compañía desde la cuenta principal
    const companyData = await hubspotClient.crm.companies.basicApi.getById(companyIdMain);

    // Filtrar propiedades nulas
    const sanitizedProps: Record<string, string> = {};
    Object.entries(companyData.properties).forEach(([key, value]) => {
      if (value !== null) {
        sanitizedProps[key] = value;
      }
    });

    // Crear la compañía en la cuenta mirror
    const created = await hubspotClientMirror.crm.companies.basicApi.create({
      properties: sanitizedProps
    });

    return res.status(201).json({
      message: 'Compañía sincronizada correctamente',
      data: created
    });
  } catch (error: any) {
    console.error('❌ Error al sincronizar compañía:', error.message);
    return res.status(500).json({
      message: 'Error al sincronizar compañía',
      error: error.message
    });
  }
}
