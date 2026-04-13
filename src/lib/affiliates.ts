import affiliateData from "./affiliates.json";

interface AffiliateLink {
  name: string;
  url: string;
  network?: string;
  description: string;
}

interface AffiliateConfig {
  therapy: AffiliateLink[];
  books: AffiliateLink[];
  donations: AffiliateLink[];
  education?: AffiliateLink[];
  mentalHealth?: AffiliateLink[];
}

export function getAffiliateConfig(): AffiliateConfig {
  return affiliateData as AffiliateConfig;
}

export function getTherapyAffiliates(): AffiliateLink[] {
  return affiliateData.therapy || [];
}

export function getBookAffiliates(): AffiliateLink[] {
  return affiliateData.books || [];
}
