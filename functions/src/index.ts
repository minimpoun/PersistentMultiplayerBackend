import * as functions from "firebase-functions";
import * as express from "express";
import {
  createCharacter,
  getAllCharacters,
  getCharacter,
  updateInventory,
} from "./character.controller";
import { validateUser } from "./validate.middleware";

const app = express();
app.use(validateUser);

app.post("/createCharacter", createCharacter);
app.get("/getAllCharacters", getAllCharacters);
app.post("/getCharacter", getCharacter);
app.post("/updateInventory", updateInventory);

exports.app = functions.https.onRequest(app);
