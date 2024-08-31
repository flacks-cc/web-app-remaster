export interface Product{
    idProduct: number;
    name: string;
    brand?: string;
    description?: string;
    price: number;
    images: Image [];
}

export interface Image {
    id: number;
    image: string;
    imageUrl: string;
}

