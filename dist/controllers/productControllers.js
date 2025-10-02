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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProductsController = GetProductsController;
exports.GetProductsByIdController = GetProductsByIdController;
exports.CreateProductController = CreateProductController;
exports.UpdateProductController = UpdateProductController;
exports.UpdateProductPhotoController = UpdateProductPhotoController;
exports.DeleteProductController = DeleteProductController;
const productServices_1 = require("../services/productServices");
const productSchemas_1 = require("../schemas/productSchemas");
const fileUploadHelper_1 = require("../helper/fileUploadHelper");
function GetProductsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const products = yield (0, productServices_1.GetProductsService)();
            res.status(200).send({ message: "Products retrieved successfully", data: products });
        }
        catch (err) {
            next(err);
        }
    });
}
function GetProductsByIdController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const productId = req.params.id;
            const product = yield (0, productServices_1.GetProductByIdService)(productId);
            res.status(200).send({ message: "Product retrieved successfully", data: product });
        }
        catch (err) {
            next(err);
        }
    });
}
function CreateProductController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const productData = productSchemas_1.CreateProductSchema.parse(req.body);
            const newProduct = yield (0, productServices_1.CreateProductService)(productData);
            res.status(200).send({ message: "Product created successfully", data: newProduct });
        }
        catch (err) {
            next(err);
        }
    });
}
function UpdateProductController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const productId = req.params.id;
            const productData = productSchemas_1.UpdateProductSchema.parse(req.body);
            const updatedProduct = yield (0, productServices_1.UpdateProductService)(productId, productData);
            res.status(200).send({ message: "Product updated successfully", data: updatedProduct });
        }
        catch (err) {
            next(err);
        }
    });
}
function UpdateProductPhotoController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const productId = req.params.id;
            const { file } = req;
            if (!file)
                throw new Error("File not found");
            // 2. Convert the file buffer to a Data URI
            const fileUri = (0, fileUploadHelper_1.bufferToDataURI)(file.buffer, file.mimetype);
            const imageUrl = yield (0, productServices_1.UpdateProductPhotoService)(fileUri, productId);
            res.status(200).send({
                message: `Image uploaded and URL saved successfully!`,
                data: imageUrl,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function DeleteProductController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const productId = req.params.id;
            yield (0, productServices_1.DeleteProductService)(productId);
            res.status(200).send({ message: "Product deleted successfully" });
        }
        catch (err) {
            next(err);
        }
    });
}
//# sourceMappingURL=productControllers.js.map