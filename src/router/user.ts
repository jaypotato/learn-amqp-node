import express from "express";

import UserController from "./../controllers/userController";

export default (router: express.Router) => {
  router.post("/user", UserController.createUser);
  router.get("/user", UserController.getAllUsers);
  router.get("/user/:email", UserController.getUserByEmail);
  router.patch("/user/:email", UserController.updateUser);
  router.delete("/user/:email", UserController.deleteUser);
};
