import express from "express";
import { register, login, getAllUsers, blockUsers } from "./auth.api.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", getAllUsers);
router.patch("/users/:id", blockUsers);

export default router;