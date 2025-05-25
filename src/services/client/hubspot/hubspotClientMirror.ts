import { Client } from '@hubspot/api-client';

export const hubspotClientMirror = new Client({
  accessToken: process.env.HUBSPOT_MIRROR_TOKEN
});