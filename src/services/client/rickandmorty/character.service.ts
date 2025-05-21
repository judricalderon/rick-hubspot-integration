import axios from 'axios';
import { CharacterApiResponse, Character } from '../../../types/character.types';

function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

export async function getFilteredCharacters(): Promise<Character[]> {
  const url = 'https://rickandmortyapi.com/api/character';
  let results: Character[] = [];
  let nextUrl: string | null = url;

  try {
    while (nextUrl) {
    const { data }: { data: CharacterApiResponse } = await axios.get(nextUrl);
      results = results.concat(data.results);
      nextUrl = data.info.next;
    }

    const filtered = results.filter((c) => c.id === 1 || isPrime(c.id));
    return filtered;
  } catch (error) {
    console.error('Error en getFilteredCharacters:', error);
    throw error;
  }
}
