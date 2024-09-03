export interface Service {
    [x: string]: any;
    idService: number;
    name: string;
    description: string;
    price?: number;
    duration?: number;
    images: Image [];
}

export interface Image {
    id: number;
    image: string;
    imageUrl: string;
}

