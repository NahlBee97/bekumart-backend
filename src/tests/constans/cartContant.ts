import { ICart } from "../../interfaces/cartInterfaces";

export const userId = "user1";
export const userCart: ICart = {
  id: "cart1",
  userId,
  items: [
    {
      id: "item1",
      cartId: "cart1",
      productId: "product1",
      product: {
        id: "product1",
        name: "Product 1",
        price: 10000,
        description: "A sample product",
        stock: 10,
        sale: 100,
        weightInKg: 1,
        categoryId: "category1",
        category: {
          id: "category1",
          name: "Category 1",
          imageUrl: "stringImage"
        },
        rating: null,
        productPhotos: [
          {
            id: "photo1",
            productId: "product1",
            imageUrl: "http://example.com/photo1.jpg",
            isDefault: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      quantity: 1,
    },
    {
      id: "item2",
      cartId: "cart2",
      productId: "product2",
      product: {
        id: "product2",
        name: "Product 2",
        price: 10000,
        description: "A sample product",
        stock: 10,
        sale: 100,
        weightInKg: 2,
        categoryId: "category2",
        category: {
          id: "category2",
          name: "Category 2",
          imageUrl: "stringImage"
        },
        rating: null,
        productPhotos: [
          {
            id: "photo2",
            productId: "product2",
            imageUrl: "http://example.com/photo2.jpg",
            isDefault: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      quantity: 2,
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const returnCart = {
  ...userCart,
  totalQuantity: 3,
  totalPrice: 30000,
  totalWeight: 5,
};

export const product = {
  id: userCart.items[0].product.id,
  stock: userCart.items[0].product.stock,
};
