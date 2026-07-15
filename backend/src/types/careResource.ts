export type CareResourceType = "title-x" | "hrsa-health-center";

export interface CareResource {
  id: string;
  type: CareResourceType;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  url: string;
  lat: number;
  lng: number;
  sourceUrl: string;
  sourceUpdatedAt?: string;
}
