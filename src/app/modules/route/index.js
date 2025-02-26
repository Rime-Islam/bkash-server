import { Router } from "express";
import AuthRouter from "../Auth/auth.route.js";
import MoneyRouter from "../money/money.route.js";

const router = Router();
const modulesRoute = [
    {
        path: "/auth",
        route: AuthRouter
    },
    {
        path: "/money",
        route: MoneyRouter
    },


];


modulesRoute.forEach((route) => router.use(route.path, route.route));
export default router;