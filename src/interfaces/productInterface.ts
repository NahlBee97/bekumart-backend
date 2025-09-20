export interface INewProduct {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  weightInKg: number;
  categoryId: string;
}

export interface IUpdateProduct {
  name?: string | undefined;
  description?: string | undefined;
  price?: number | undefined;
  imageUrl?: string | undefined;
  stock?: number | undefined;
  weightInKg?: number | undefined;
  categoryId?: string | undefined;
}