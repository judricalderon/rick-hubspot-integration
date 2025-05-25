import { Client } from '@hubspot/api-client';
import dotenv from 'dotenv';


dotenv.config();

export const hubspotClient = new Client({
  accessToken: process.env.HUBSPOT_TOKEN,
});
