import { syncAllCompaniesFromMainToMirror } from '../src/services/internal/syncAllCompaniesService';
import { hubspotClient } from '../src/services/client/hubspot/hubspotClient';
import { hubspotClientMirror } from '../src/services/client/hubspot/hubspotClientMirror';
import { SimplePublicObject } from '@hubspot/api-client/lib/codegen/crm/companies';

describe('syncAllCompaniesFromMainToMirror', () => {
  const mockGetPage = jest.fn();
  const mockCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(hubspotClient.crm.companies.basicApi, 'getPage').mockImplementation(mockGetPage);
    jest.spyOn(hubspotClientMirror.crm.companies.basicApi, 'create').mockImplementation(mockCreate);
  });

  it('debe sincronizar las compañías correctamente', async () => {
    const mockCompanies: SimplePublicObject[] = [
      {
        id: '123',
        properties: {
          name: 'Compañía A',
          domain: 'compania-a.com',
          createdate: 'readonly',
          hs_object_id: 'readonly',
          lastmodifieddate: 'readonly'
        }
      } as unknown as SimplePublicObject
    ];

    mockGetPage.mockResolvedValue({ results: mockCompanies });
    mockCreate.mockResolvedValue({ id: 'mirror-123' });

    const result = await syncAllCompaniesFromMainToMirror();

    expect(result).toEqual([
      {
        id: '123',
        status: 'synced',
        mirrorId: 'mirror-123'
      }
    ]);

    expect(mockCreate).toHaveBeenCalledWith({
      properties: {
        name: 'Compañía A',
        domain: 'compania-a.com'
      }
    });
  });

  it('debe registrar un error si no puede crear una compañía en mirror', async () => {
    const mockCompanies: SimplePublicObject[] = [
      {
        id: '456',
        properties: {
          name: 'Compañía B',
          domain: 'compania-b.com'
        }
      } as unknown as SimplePublicObject
    ];

    mockGetPage.mockResolvedValue({ results: mockCompanies });
    mockCreate.mockRejectedValue(new Error('Error de API'));

    const result = await syncAllCompaniesFromMainToMirror();

    expect(result).toEqual([
      {
        id: '456',
        status: 'error',
        error: 'Error de API'
      }
    ]);
  });
});
