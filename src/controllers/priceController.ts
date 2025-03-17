import { Elysia, t } from "elysia";
import * as priceService from "../services/priceService";

const prices = new Elysia({ prefix: 'price' })
    // Set product price
    .post('/:productId/set', async ({ params, body }) => {
        const price = await priceService.setProductPrice(params.productId, body.price, body.discount);
        return { data: price };
    }, {
        body: t.Object({
            price: t.Number(),
            discount: t.Number()
        })
    })

    // Get price history of a product
    .get('/:productId/history', async ({ params }) => {
        const priceHistory = await priceService.getPriceHistory(params.productId);
        return { data: priceHistory };
    });

export default prices;