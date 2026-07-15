import {parse} from "csv-parse/sync";
import type {CareResource} from "../src/types/careResource";

const TITLE_X_URL =
  "https://api.reproductivehealthservices.gov/v1/clinics?latitude=39.8283&longitude=-98.5795&range=10000&limit=5000";
const TITLE_X_SOURCE_URL = "https://reproductivehealthservices.gov/";
const HRSA_URL =
  "https://data.hrsa.gov/DataDownload/DD_Files/Health_Center_Service_Delivery_and_LookAlike_Sites.csv";
const HRSA_SOURCE_URL =
  "https://data.hrsa.gov/data/download?titleFilter=Health+Center";

interface TitleXClinic {
  id: string;
  name: string;
  addressPhysicalStreet1: string;
  addressPhysicalStreet2: string;
  addressPhysicalCity: string;
  addressPhysicalState: string;
  addressPhysicalZip: string;
  phone: string;
  url: string;
  latitude: number;
  longitude: number;
}

interface HrsaRow {
  "BPHC Assigned Number": string;
  "Health Center Number": string;
  "Health Center Location Identification Number": string;
  "Site Name": string;
  "Site Address": string;
  "Site City": string;
  "Site State Abbreviation": string;
  "Site Postal Code": string;
  "Site Telephone Number": string;
  "Site Web Address": string;
  "Site Status Description": string;
  "Geocoding Artifact Address Primary X Coordinate": string;
  "Geocoding Artifact Address Primary Y Coordinate": string;
  "Data Warehouse Record Create Date": string;
}

const fetchText = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
};

const [titleXResponse, hrsaCsv] = await Promise.all([
  fetch(TITLE_X_URL),
  fetchText(HRSA_URL),
]);

if (!titleXResponse.ok) {
  throw new Error(`${TITLE_X_URL} returned ${titleXResponse.status}`);
}

const titleXPayload = (await titleXResponse.json()) as {clinics: TitleXClinic[]};
const titleXClinics: CareResource[] = titleXPayload.clinics.map((clinic) => ({
  id: `title-x:${clinic.id}`,
  type: "title-x",
  name: clinic.name,
  address: [clinic.addressPhysicalStreet1, clinic.addressPhysicalStreet2]
    .filter(Boolean)
    .join(", "),
  city: clinic.addressPhysicalCity,
  state: clinic.addressPhysicalState,
  zip: clinic.addressPhysicalZip,
  phone: clinic.phone || "",
  url: clinic.url || "",
  lat: clinic.latitude,
  lng: clinic.longitude,
  sourceUrl: TITLE_X_SOURCE_URL,
}));

const hrsaRows = parse(hrsaCsv, {
  bom: true,
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
}) as HrsaRow[];

const hrsaHealthCenters: CareResource[] = hrsaRows
  .filter((row) => row["Site Status Description"] === "Active")
  .map((row) => ({
    id: `hrsa:${row["BPHC Assigned Number"]}`,
    type: "hrsa-health-center" as const,
    name: row["Site Name"],
    address: row["Site Address"] || "",
    city: row["Site City"] || "",
    state: row["Site State Abbreviation"] || "",
    zip: row["Site Postal Code"] || "",
    phone: row["Site Telephone Number"] || "",
    url: row["Site Web Address"] || "",
    lat: Number(row["Geocoding Artifact Address Primary Y Coordinate"]),
    lng: Number(row["Geocoding Artifact Address Primary X Coordinate"]),
    sourceUrl: HRSA_SOURCE_URL,
    sourceUpdatedAt: row["Data Warehouse Record Create Date"] || undefined,
  }))
  .filter(
    (resource) =>
      resource.name &&
      /^[A-Z]{2}$/.test(resource.state) &&
      Number.isFinite(resource.lat) &&
      Number.isFinite(resource.lng),
  );

const snapshot = {
  retrievedAt: new Date().toISOString(),
  resources: [...titleXClinics, ...hrsaHealthCenters],
};

const output = new URL(
  "../src/seed/generated/careResources.data.json",
  import.meta.url,
);
await Bun.write(output, `${JSON.stringify(snapshot)}\n`);

console.log(
  `Wrote ${titleXClinics.length} Title X clinics and ${hrsaHealthCenters.length} HRSA health centers to ${output.pathname}`,
);
