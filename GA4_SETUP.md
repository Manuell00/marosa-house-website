# GA4 Setup

1. Create or open a Google Analytics 4 property for `marosahouse.it`.
2. In `Admin` -> `Data Streams` -> `Web`, copy the `Measurement ID` in the format `G-XXXXXXXXXX`.
3. Replace the placeholder value in [js/analytics-config.js](/Users/manuelcaselli/Downloads/3%20-%20Lavoro/Progetti/marosa-site/js/analytics-config.js).
4. Deploy the site.
5. Open the website, accept cookies, and verify in `Realtime` that visits are arriving.
6. In GA4 create or open a report that includes:
   - Users
   - Views
   - Views by page path
   - `begin_checkout` events
   - `generate_lead` events
   - `select_content` events
7. Schedule the report weekly to `manuell.caselli@gmail.com`.
8. In `Admin` -> `Events`, mark these as conversions:
   - `generate_lead`
   - `begin_checkout`

Tracked interactions after consent:
- Page visits
- Clicks on internal booking links
- Clicks on WhatsApp
- Clicks on Airbnb
- Clicks on Booking
- Booking form submissions
- Email and WhatsApp actions from the booking form
