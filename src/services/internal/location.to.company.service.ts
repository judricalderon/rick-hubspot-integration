import { getAllLocations } from '../client/rickandmorty/location.service';
import { createCompany } from '../client/hubspot/hubspot.service';

export async function createCompaniesFromLocations() {
  const locations = await getAllLocations();
  const results = [];

  for (const loc of locations) {
    const response = await createCompany(loc.name, loc.type);

    if (response.id) {
      results.push({ location: loc.name, status: 'created' });
    } else {
      results.push({ location: loc.name, status: 'error' });
    }
  }

  return results;
}
