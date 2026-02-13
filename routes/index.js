import express from "express";
import cors from "cors";
const app = express();
import adminRoutes from "../Controllers/adminController.js";
import productRoutes from "../Controllers/productControllers.js";
import complaintRoutes from "../Controllers/complaintControllers.js";
import userRoutes from "../Controllers/UsersControllers.js";
import nodemailer from "nodemailer";

import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import connectDb from "../database/db.js";
connectDb();

app.use(express.static("."));
app.use(cors());
app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});

app.use(bodyParser.json());
app.use("/", adminRoutes);
app.use("/product", productRoutes);
app.use("/complaint", complaintRoutes);
app.use("/user", userRoutes);

// app.get('/', (req, res) => {
//     res. send("welcom to node");
// })