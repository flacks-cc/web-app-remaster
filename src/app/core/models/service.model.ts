export interface Service {
    id: number;
    name: string;
    description: string;
    price?: number;
    duration?: number;
    images?: string[];
  }