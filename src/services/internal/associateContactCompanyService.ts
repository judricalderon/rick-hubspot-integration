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
    .normalize('NFD')                // descompone letras con acentos
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

  // Mostrar contactos y compañías disponibles (normalizados)
  
  contacts.forEach(c => console.log('👤', normalize(c.properties?.firstname)));
 
  companies.forEach(c => console.log('🏢', normalize(c.properties?.name)));

  // Procesar cada personaje
  for (const char of characters) {
    const charName = normalize(char.name);
    const locationName = normalize(char.location?.name);

    

    // Ubicación inválida
    if (!locationName || locationName === 'unknown') {
      results.push({ contact: char.name, company: char.location.name, status: 'invalid location' });
      continue;
    }

    // Buscar coincidencias por nombre de contacto
    const matchingContacts = contacts.filter(
      c => normalize(c.properties?.firstname) === charName
    );

    if (matchingContacts.length === 0) {
      results.push({ contact: char.name, company: char.location.name, status: 'contact not found' });
      continue;
    }

    // Buscar compañía por nombre de ubicación
    const company = companies.find(
      c => normalize(c.properties?.name) === locationName
    );

    if (!company) {
      results.push({ contact: char.name, company: char.location.name, status: 'company not found' });
      continue;
    }

    // Asociar cada contacto encontrado a la compañía
    for (const contact of matchingContacts) {
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
    }
  }

  return results;
}
