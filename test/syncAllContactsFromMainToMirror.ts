import { syncAllContactsFromMainToMirror } from '../src/services/internal/syncAllContactsService';
import { hubspotClient } from '../src/services/client/hubspot/hubspotClient';
import { hubspotClientMirror } from '../src/services/client/hubspot/hubspotClientMirror';

describe('syncAllContactsFromMainToMirror', () => {
  afterEach(() => {
    jest.restoreAllMocks(); // Limpia los mocks después de cada prueba
  });

  it('debe sincronizar los contactos correctamente', async () => {
    const mockContacts = [
      {
        id: '1',
        properties: {
          email: 'morty@example.com',
          firstname: 'Morty',
          lastname: 'Smith',
          createdate: '2024-01-01',
          hs_object_id: '99999',
        },
      },
    ];

    jest
      .spyOn(hubspotClient.crm.contacts.basicApi, 'getPage')
      .mockResolvedValue({ results: mockContacts } as any);

    jest
      .spyOn(hubspotClientMirror.crm.contacts.basicApi, 'create')
      .mockResolvedValue({ id: 'mirror-1' } as any);

    const result = await syncAllContactsFromMainToMirror();

    expect(result).toEqual([
      { id: '1', status: 'synced', mirrorId: 'mirror-1' },
    ]);
  });

  it('debe registrar un error si no puede crear un contacto en mirror', async () => {
    const mockContacts = [
      {
        id: '2',
        properties: {
          email: 'rick@example.com',
          firstname: 'Rick',
          lastname: 'Sanchez',
        },
      },
    ];

    jest
      .spyOn(hubspotClient.crm.contacts.basicApi, 'getPage')
      .mockResolvedValue({ results: mockContacts } as any);

    jest
      .spyOn(hubspotClientMirror.crm.contacts.basicApi, 'create')
      .mockRejectedValue(new Error('Contact already exists'));

    const result = await syncAllContactsFromMainToMirror();

    expect(result).toEqual([
      { id: '2', status: 'error', error: 'Contact already exists' },
    ]);
  });
});
