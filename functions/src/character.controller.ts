/* eslint-disable max-len */
import { Response } from "express";
import { admin, db } from "./config/firebase";

type CharacterType = {
  name: string;
  level: number;
  inventory: [
    {
      itemId: string;
      itemCount: number;
    }
  ];
};

type CreateRequest = {
  body: CharacterType;
  params: { id: string };
  user: admin.auth.DecodedIdToken;
};

type GetAllCharactersRequest = {
  user: admin.auth.DecodedIdToken;
};

type GetRequest = {
  body: {
    id: string;
  };
  user: admin.auth.DecodedIdToken;
};

type UpdateRequest = {
  body: {
    id: string;
    newItem: {
      itemId: string;
      itemCount: number;
    };
  };
  user: admin.auth.DecodedIdToken;
};

const createCharacter = async (
    req: CreateRequest,
    res: Response
): Promise<void> => {
  const { name } = req.body;

  try {
    const user = db.collection("users").doc(req.user.uid);
    await user.set(
        {
          timeChanged: Date.now(),
        },
        { merge: true }
    );

    const character = user.collection("characters").doc();
    const userObject = {
      name,
      level: 1,
      inventory: [],
    };

    character.set(userObject);

    res.status(201).send({
      status: "created",
      message: "Created new character",
      data: userObject,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllCharacters = async (
    req: GetAllCharactersRequest,
    res: Response
): Promise<void> => {
  const { uid } = req.user;
  const user = await db
      .collection("users")
      .doc(uid)
      .collection("characters")
      .get();
  const characters = user.docs.map((doc) => {
    const data = doc.data();
    return { ...data, id: doc.id };
  });
  res.status(200).send(characters);
};

const getCharacter = async (req: GetRequest, res: Response): Promise<void> => {
  const { id } = req.body;
  const { uid } = req.user;
  const character = await db
      .collection("users")
      .doc(uid)
      .collection("characters")
      .doc(id)
      .get();
  res.status(200).send(character.data());
};

const updateInventory = async (
    req: UpdateRequest,
    res: Response
): Promise<void> => {
  const { id, newItem } = req.body;
  const { uid } = req.user;
  let character;
  try {
    character = db
        .collection("users")
        .doc(uid)
        .collection("characters")
        .doc(id);
  } catch {
    res.status(500).send({ error: "failed to get character" });
  }

  let outputData;
  try {
    if (character === undefined) {
      res.status(404).send({ error: "character was undefined" });
      return;
    }
    const doc = await character.get();
    outputData = doc.data();
    if (!outputData) {
      res.status(404).send({ error: "Invalid" });
      return undefined;
    }
  } catch {
    res.status(500).send({ error: "output data was undefined" });
  }

  try {
    if (outputData === undefined || character === undefined) {
      res.status(404).send({ error: "Output data or character was undefined" });
      return;
    }

    if (outputData.inventory === undefined) {
      res.status(404).send({ error: "Not Found" });
      return;
    }
    await character.update({
      inventory: admin.firestore.FieldValue.arrayUnion(newItem),
    });
    res.status(200).send({ message: "Updated Inventory" });
  } catch {
    res.status(500).send({ error: "failed to update inventory" });
  }
};

export { createCharacter, getAllCharacters, getCharacter, updateInventory };
