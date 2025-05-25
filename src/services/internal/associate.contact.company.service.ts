import { getFilteredCharacters } from '../client/rickandmorty/character.service';
import {
  getAllContacts,
  getAllCompanies,
  associateContactToCompany
} from '../client/hubspot/hubspot.service';

export async function associateContactsToCompanies() {
  const characters = await getFilteredCharacters();
  const contacts = await getAllContacts();
  const companies = await getAllCompanies();
  const results = [];

  for (const char of characters) {
    // 🔹 Ignorar ubicaciones inválidas
    if (!char.location?.name || char.location.name.toLowerCase() === 'unknown') {
      results.push({
        contact: char.name,
        company: char.location?.name || 'unknown',
        status: 'invalid location'
      });
      continue;
    }

    // 🔹 Buscar contacto y compañía en HubSpot
    const contact = contacts.find(
      c => c.properties?.firstname?.toLowerCase() === char.name.toLowerCase()
    );

    const company = companies.find(
      c => c.properties?.name?.toLowerCase() === char.location.name.toLowerCase()
    );

    if (contact && company) {
      try {
        await associateContactToCompany(contact.id, company.id);
        results.push({
          contact: char.name,
          company: char.location.name,
          status: 'associated'
        });
      } catch (error: any) {
        results.push({
          contact: char.name,
          company: char.location.name,
          status: 'error',
          error: error.message || 'Unknown error'
        });
      }
    } else {
      results.push({
        contact: char.name,
        company: char.location.name,
        status: 'not found'
      });
    }
  }

  return results;
}
