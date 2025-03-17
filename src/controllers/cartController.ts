import { Elysia, t } from "elysia";
import * as cartService from "../services/cartService";
import { ObjectId } from "mongodb";

const carts = new Elysia({ prefix: 'cart' })
    // Add product to cart
    .post('/:userId/add', async ({ params, body }) => {
        const cart = await cartService.addToCart(params.userId, body.productId, body.quantity);
        return { data: cart };
    }, {
        body: t.Object({
            productId: t.String(),
            quantity: t.Number()
        })
    })

    // Get the cart for a user
    .get('/:userId', async ({ params }) => {
        const cart = await cartService.getCart(params.userId);
        if (!cart) {
            return { error: "Cart not found" };
        }
        return { data: cart };
    })

    // Remove product from cart
    .delete('/:userId/remove', async ({ params, body }) => {
        const cart = await cartService.removeFromCart(params.userId, body.productId);
        if (!cart) {
            return { error: "Product not found in cart" };
        }
        return { data: cart };
    }, {
        body: t.Object({
            productId: t.String()
        })
    })

    // Clear the user's cart
    .delete('/:userId/clear', async ({ params }) => {
        const cart = await cartService.clearCart(params.userId);
        if (!cart) {
            return { error: "Failed to clear cart" };
        }
        return { message: "Cart cleared successfully" };
    });

export default carts;