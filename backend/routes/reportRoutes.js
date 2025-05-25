import express from "express";
import {getInventoryReport } from "../controllers/reportController.js";

const router = express.Router();
router.get("/inventory", getInventoryReport);

export default router;