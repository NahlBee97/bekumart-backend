export interface INewProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  weightInKg: number;
  categoryId: string;
}

export interface IUpdateProduct {
  name?: string | undefined;
  description?: string | undefined;
  price?: number | undefined;
  stock?: number | undefined;
  weightInKg?: number | undefined;
  categoryId?: string | undefined;
}