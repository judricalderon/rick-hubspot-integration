import { getFilteredCharacters } from '../client/rickandmorty/character.service';
import { getAllContacts, getAllCompanies, associateContactToCompany } from '../client/hubspot/hubspot.service';

export async function associateContactsToCompanies() {
  const characters = await getFilteredCharacters();
  const contacts = await getAllContacts();
  const companies = await getAllCompanies();
  const results = [];

  for (const char of characters) {
    const contact = contacts.find(c => c.properties?.firstname === char.name);
    const company = companies.find(c => c.properties?.name === char.location.name);

    if (contact && company) {
      try {
        await associateContactToCompany(contact.id, company.id);
        results.push({ contact: char.name, company: char.location.name, status: 'associated' });
      } catch (error: any) {
        results.push({ contact: char.name, company: char.location.name, status: 'error', error: error.message });
      }
    } else {
      results.push({ contact: char.name, company: char.location.name, status: 'not found' });
    }
  }

  return results;
}
