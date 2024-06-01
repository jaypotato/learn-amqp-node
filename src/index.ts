import express from "express";
import http from "http";
import mongoose from "mongoose";
import { cronBirthdayReminder } from "./services/reminder/birthdayReminder";
require("dotenv").config();
import { BirthdayConsumer } from "./consumer/birthdayConsumer";

import router from "./router";

const app = express();
app.use(express.json());

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
  console.log(`server running on ${process.env.PORT}`);
});

const MONGO_URL = process.env.DB || "mongodb://localhost:27017/birthday-app";

mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on("error", (error: Error) => console.log(error));

app.use("/", router());

// cron tasks
cronBirthdayReminder();

// queue consumer
const bc = new BirthdayConsumer()
bc.consume()