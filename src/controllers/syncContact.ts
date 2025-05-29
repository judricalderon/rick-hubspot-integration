import { Request, Response } from 'express';
import { hubspotClient } from '../services/client/hubspot/hubspotClient';

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

    return res.status(201).json({
      message: 'Compañía obtenida correctamente (esperando que el webhook la replique)',
      data: sanitizedProps
    });
  } catch (error: any) {
    console.error('❌ Error al obtener compañía:', error.message);
    return res.status(500).json({
      message: 'Error al obtener compañía',
      error: error.message
    });
  }
}
