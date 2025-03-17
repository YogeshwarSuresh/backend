import {Elysia, t} from "elysia";
import * as orderService from "../services/orderService";

const orders = new Elysia({prefix: 'order'})
    // Create an order
    .post('/:userId/create', async ({params, body}) => {
        const order = await orderService.createOrder(params.userId, body.products, body.totalPrice);
        return {data: order};
    }, {
        body: t.Object({
            products: t.Array(t.Object({
                product: t.String(),
                quantity: t.Number(),
                price: t.Number()
            })),
            totalPrice: t.Number()
        })
    })

    // Get orders by user ID
    .get('/:userId', async ({params}) => {
        const orders = await orderService.getOrders(params.userId);
        return {data: orders};
    })

    // Update the order status
    .put('/:orderId/status', async ({params, body}) => {
        const order = await orderService.updateOrderStatus(params.orderId, body.status);
        if (!order) {
            return {error: "Order not found or failed to update"};
        }
        return {data: order};
    }, {
        body: t.Object({
            status: t.String()
        })
    })

    // Delete an order
    .delete('/:orderId', async ({params}) => {
        const order = await orderService.deleteOrder(params.orderId);
        if (!order) {
            return {error: "Order not found or failed to delete"};
        }
        return {message: "Order deleted successfully"};
    });

export default orders;