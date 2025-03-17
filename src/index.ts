import Elysia from "elysia";
import connectDB from "./config/db";

import users from './controllers/userController'

const app = new Elysia();

await connectDB();
app.get("/", () => "Hello Elysia")
app.use(users)

app.listen(3000, () => {
    console.log("Server started on port 3000");
});