
export interface PublisherApiResponse {
  [key: string]: string[] | undefined;
  Affiliate: string[];
  "Whitelisted Publisher"?: string[];
  "Whitelisted Affiliate"?: string[];
}

export interface FilterApiResponse {
  data: string[];
  isLoading: boolean;
}