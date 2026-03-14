import fs from "node:fs/promises";

const DAY_MS = 24 * 60 * 60 * 1000;
const outputPath = new URL("../js/availability-data.js", import.meta.url);

const calendars = [
  { key: "bixio", title: "Disponibilita MaRoSa Bixio", url: process.env.BIXIO_ICS_URL },
  { key: "magnolie", title: "Disponibilita MaRoSa Magnolie", url: process.env.MAGNOLIE_ICS_URL },
];

const missing = calendars.filter((calendar) => !calendar.url);

if (missing.length > 0) {
  console.error(
    "Missing ICS URL. Set both BIXIO_ICS_URL and MAGNOLIE_ICS_URL before running this script."
  );
  process.exit(1);
}

function unfoldLines(text) {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .reduce((lines, line) => {
      if (/^[ \t]/.test(line) && lines.length > 0) {
        lines[lines.length - 1] += line.slice(1);
      } else {
        lines.push(line);
      }
      return lines;
    }, []);
}

function parseDate(value) {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6)) - 1;
  const day = Number(value.slice(6, 8));
  return new Date(Date.UTC(year, month, day));
}

function toKey(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseBookedDates(icsText) {
  const lines = unfoldLines(icsText);
  const booked = new Set();
  let event = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      event = {};
      continue;
    }

    if (line === "END:VEVENT") {
      if (event?.start && event?.end && event.status !== "CANCELLED") {
        let current = parseDate(event.start);
        const end = parseDate(event.end);

        while (current < end) {
          booked.add(toKey(current));
          current = new Date(current.getTime() + DAY_MS);
        }
      }

      event = null;
      continue;
    }

    if (!event) continue;

    if (line.startsWith("DTSTART")) event.start = line.split(":")[1];
    if (line.startsWith("DTEND")) event.end = line.split(":")[1];
    if (line.startsWith("STATUS")) event.status = line.split(":")[1];
  }

  return [...booked].sort();
}

async function loadCalendar(calendar) {
  const response = await fetch(calendar.url);

  if (!response.ok) {
    throw new Error(`Unable to fetch ${calendar.key}: ${response.status} ${response.statusText}`);
  }

  const icsText = await response.text();

  return {
    ...calendar,
    booked: parseBookedDates(icsText),
  };
}

const results = await Promise.all(calendars.map(loadCalendar));

const output = `window.marosaAvailability = ${JSON.stringify(
  Object.fromEntries(
    results.map((calendar) => [
      calendar.key,
      {
        title: calendar.title,
        booked: calendar.booked,
      },
    ])
  ),
  null,
  4
)};\n`;

await fs.writeFile(outputPath, output, "utf8");

console.log(`Updated ${outputPath.pathname} with Airbnb availability data.`);
