"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProductsService = GetProductsService;
exports.GetProductByIdService = GetProductByIdService;
exports.CreateProductService = CreateProductService;
exports.UpdateProductService = UpdateProductService;
exports.UpdateProductPhotoService = UpdateProductPhotoService;
exports.DeleteProductService = DeleteProductService;
const fileUploadHelper_1 = require("../helper/fileUploadHelper");
const prisma_1 = require("../lib/prisma");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
function GetProductsService() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const products = yield prisma_1.prisma.products.findMany({
                include: { category: true },
            });
            return products;
        }
        catch (err) {
            throw err;
        }
    });
}
function GetProductByIdService(productId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const product = yield prisma_1.prisma.products.findUnique({
                where: { id: productId },
                include: { category: true },
            });
            return product;
        }
        catch (err) {
            throw err;
        }
    });
}
function CreateProductService(productData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newProduct = yield prisma_1.prisma.products.create({
                data: productData,
            });
            return newProduct;
        }
        catch (err) {
            throw err;
        }
    });
}
function UpdateProductService(productId, productData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, price, description, stock, weightInKg, categoryId, } = productData;
            const existingProduct = yield prisma_1.prisma.products.findUnique({
                where: { id: productId },
            });
            if (!existingProduct)
                throw new Error("Product not found");
            const updatedProduct = yield prisma_1.prisma.products.update({
                where: { id: productId },
                data: {
                    name: name || existingProduct.name,
                    price: price || existingProduct.price,
                    description: description || existingProduct.description,
                    stock: stock || existingProduct.stock,
                    weightInKg: weightInKg || existingProduct.weightInKg,
                    categoryId: categoryId || existingProduct.categoryId,
                },
            });
            return updatedProduct;
        }
        catch (err) {
            throw err;
        }
    });
}
function UpdateProductPhotoService(fileUri, productId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const existingProduct = yield prisma_1.prisma.products.findUnique({
                where: { id: productId },
            });
            if (!existingProduct)
                throw new Error("Product not found");
            let publicId = `products/product_${productId}_${Date.now()}`; // Default for new images
            if (existingProduct.imageUrl) {
                const existingPublicId = (0, fileUploadHelper_1.getPublicIdFromUrl)(existingProduct.imageUrl);
                if (existingPublicId) {
                    publicId = existingPublicId; // Use existing public_id to overwrite
                }
            }
            // Upload the image to Cloudinary
            const uploadResult = yield cloudinary_1.default.uploader.upload(fileUri, {
                public_id: publicId,
                overwrite: true,
                folder: "products",
            });
            const imageUrl = uploadResult.secure_url;
            yield prisma_1.prisma.products.update({
                where: { id: productId },
                data: { imageUrl },
            });
            return imageUrl;
        }
        catch (err) {
            throw err;
        }
    });
}
function DeleteProductService(productId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const existingProduct = yield prisma_1.prisma.products.findUnique({
                where: { id: productId },
            });
            if (!existingProduct)
                throw new Error("Product not found");
            yield prisma_1.prisma.products.delete({
                where: { id: productId },
            });
        }
        catch (err) {
            throw err;
        }
    });
}
//# sourceMappingURL=productServices.js.map