import { Elysia, t } from "elysia";
import { ObjectId } from "mongodb";
import * as productService from "../services/productService";

const products = new Elysia({ prefix: 'product' })
    // Create a new product
    .post('/create', async ({ body }) => {
        const product = await productService.createProduct(body);
        return { data: product };
    }, {
        body: t.Object({
            name: t.String(),
            description: t.String(),
            price: t.Number(),
            category: t.String(),
            company: t.String()
        })
    })

    .get('/', async () => {
        const products = await productService.getProducts();
        return { data: products };
    })

    .get('/:id', async ({ params }) => {
        const product = await productService.getProductById(params.id);
        if (!product) {
            return { error: "Product not found" };
        }
        return { data: product };
    })

    .put('/:id', async ({ params, body }) => {
        const product = await productService.updateProduct(params.id, body);
        if (!product) {
            return { error: "Product not found or failed to update" };
        }
        return { data: product };
    }, {
        body: t.Partial(t.Object({
            name: t.String(),
            description: t.String(),
            price: t.Number(),
            category: t.String(),
            company: t.String()
        }))
    })

    .delete('/:id', async ({ params }) => {
        const product = await productService.deleteProduct(params.id);
        if (!product) {
            return { error: "Product not found or failed to delete" };
        }
        return { message: "Product deleted successfully" };
    });

export default products;