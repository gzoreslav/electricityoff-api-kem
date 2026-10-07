import express from 'express';
import axios from 'axios';
import * as moment from 'moment-timezone';
import { transformNew } from '../transform';

const app = express();

const PROVIDER_ID = 'KEM';
const BASE_URL =
  'https://app.yasno.ua/api/blackout-service/public/shutdowns/regions/25/dsos/902/planned-outages';

app.get('/api/v1', (_req, res) =>
  res.send('KyivOff (KEM) API Status: OK')
);

app.get(['/api/v1/off', `/api/v1/off/${PROVIDER_ID}`], async (_req, res) => {
  try {
    const response = await axios.get(BASE_URL, {
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (compatible; ElectricityOff/1.0; +https://github.com/gzoreslav/electricityoff-api-kem)',
      },
      timeout: 30_000,
    });

    const result = transformNew(response.data);

    res.send({
      ...result,
      serverTime: moment.tz('Europe/Kyiv').format('DD-MM-YYYY HH:mm'),
    });
  } catch (error: any) {
    console.error('KEM fetch failed', error?.message || error);
    res.status(500).send({
      error: error?.message || String(error),
    });
  }
});

app.listen(process.env.PORT || 3010, () =>
  console.log('KyivOff (KEM) API is ready')
);

module.exports = app;
