import userService from '../services/userService'
import {Elysia, t} from "elysia";
import jwt from 'jsonwebtoken'
import {ObjectId} from "mongodb";

const users = new Elysia({prefix: 'user'})
    .post('/register', async ({body}) => {
        const user = await userService.create(body)
        return {data: user}
    }, {
        body: t.Object({
            email: t.String(),
            name: t.String(),
            password: t.String()
        })
    })
    .post('/login', async ({ body }) => {
        const user = await userService.authenticate(body.email, body.password);
        const token = jwt.sign({ id: user._id }, "", { expiresIn: '1h' });
        return { token, user: { id: user._id, name: user.name, email: user.email } };
    }, {
        body: t.Object({
            email: t.String(),
            password: t.String()
        })
    })
    .get("/", async () => {
        const users = await userService.find()
        return {data: users};
    })
    .get("/:id", async ({params}) => {
        const users = await userService.findById(params.id);
        return {data: users};
    })
    .put("/:id", async ({params, body}) => {
        const user = await userService.findById(params.id);
        if (user) {
            const result = await userService.updateUser(new ObjectId(params.id), body);
            if (result.modifiedCount === 1) {
                return {data: {...user, ...body}};
            }
        }
        return {error: "user not found"}
    }, {
        body: t.Partial(t.Object({
            name: t.String(),
            email: t.String()
        }))
    })

export default users;