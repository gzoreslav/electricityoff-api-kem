# ElectricityOff API — Київ (KEM)

Публічне API графіків відключень для **ДТЕК Київські електромережі** (провайдер `KEM`).

Джерело даних — Yasno blackout-service, регіон `25`, оператор `902`:

```
https://app.yasno.ua/api/blackout-service/public/shutdowns/regions/25/dsos/902/planned-outages
```

Нові черги: `1.1` … `60.1` (старих підгруп `*.2` немає).

## Endpoints

- `GET /api/v1` — статус
- `GET /api/v1/off` або `GET /api/v1/off/KEM` — події відключень

### Формат відповіді

```json
{
  "events": [
    {
      "date": "2026-10-07",
      "startTime": "06:00",
      "endTime": "09:30",
      "provider": "KEM",
      "electricity": "off",
      "queue": "1.1"
    }
  ],
  "hasTodayData": true,
  "hasTomorrowData": true,
  "serverTime": "07-10-2026 11:00"
}
```

Час у джерелі — хвилини від півночі. У відповідь потрапляють лише слоти з `type: "Definite"` (відключення), коли `status === "ScheduleApplies"`.

## Deploy

```bash
npm install
npx vercel --prod
```
