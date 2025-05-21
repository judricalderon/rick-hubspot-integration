import axios from 'axios';
import { Character } from '../../types/character.types';
import { Location } from '../../types/location.types';

export async function getUniqueLocations(characters: Character[]): Promise<Location[]> {
  const locationUrls = Array.from(
    new Set(
      characters
        .map((char) => char.location.url)
        .filter((url) => url && url !== '')
    )
  );

  const locationPromises = locationUrls.map((url) => axios.get<Location>(url).then(res => res.data));

  try {
    const locations = await Promise.all(locationPromises);
    return locations;
  } catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    throw error;
  }
}
