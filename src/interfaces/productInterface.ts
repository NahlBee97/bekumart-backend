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

interface IProductPhoto {
  id: string;
  productId: string;
  imageUrl: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Corresponds to the 'Products' model
export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  productPhotos: IProductPhoto[];
  stock: number;
  sale: number | null;
  weightInKg: number;
  categoryId: string;
  rating: number | null;
  category: ICategory;
  createdAt: Date;
  updatedAt: Date;
}

// Corresponds to the 'Categories' model
export interface ICategory {
  id: string;
  name: string;
  imageUrl: string | null;
}