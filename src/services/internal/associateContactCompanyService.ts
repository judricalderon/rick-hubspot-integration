import { getFilteredCharacters } from '../client/rickandmorty/characterService';
import {
  getAllContacts,
  getAllCompanies,
  associateContactToCompany
} from '../client/hubspot/hubspotService';

/**
 * Función para normalizar nombres (elimina tildes, pasa a minúsculas y elimina espacios extra).
 */
function normalize(text?: string | null): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimina los acentos
    .toLowerCase()
    .trim();
}

/**
 * Asocia los contactos de Rick and Morty con compañías según su ubicación.
 */
export async function associateContactsToCompanies() {
  const characters = await getFilteredCharacters();
  const contacts = await getAllContacts();
  const companies = await getAllCompanies();
  const results = [];

  console.log(`🔍 Total personajes: ${characters.length}`);
  console.log(`👥 Total contactos: ${contacts.length}`);
  console.log(`🏢 Total compañías: ${companies.length}`);

  for (const char of characters) {
    const charNameNormalized = normalize(char.name);
    const locationName = normalize(char.location?.name);

    if (!locationName || locationName === 'unknown') {
      results.push({ contact: char.name, company: char.location.name, status: 'invalid location' });
      continue;
    }

    // Buscar coincidencias por nombre completo
    const matchingContacts = contacts.filter(contact => {
      const fullName = `${contact.properties?.firstname || ''} ${contact.properties?.lastname || ''}`.trim();
      const normalizedFullName = normalize(fullName);
      const match = normalizedFullName === charNameNormalized;
      return match;
    });

    if (matchingContacts.length === 0) {
      results.push({ contact: char.name, company: char.location.name, status: 'contact not found' });
      continue;
    }

    const company = companies.find(c => normalize(c.properties?.name) === locationName);

    if (!company) {
      results.push({ contact: char.name, company: char.location.name, status: 'company not found' });
      continue;
    }

    // Asociar contacto a la compañía
    for (const contact of matchingContacts) {
      try {
        console.log(`🔗 Asociando contacto ID ${contact.id} → compañía ID ${company.id}`);
        await associateContactToCompany(contact.id, company.id);
        results.push({
          contact: char.name,
          company: char.location.name,
          status: 'associated'
        });
      } catch (error: any) {
        console.error(`❌ Error asociando "${char.name}" a "${char.location.name}": ${error.message}`);
        results.push({
          contact: char.name,
          company: char.location.name,
          status: 'error',
          error: error.message || 'Unknown error'
        });
      }
    }
  }

  console.log(`✅ Asociaciones exitosas: ${results.filter(r => r.status === 'associated').length}`);
  return results;
}
