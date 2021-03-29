import {
  Bson,
  Document,
  MongoClient,
} from "https://deno.land/x/mongo@v0.22.0/mod.ts";
import { Color, ColorLevels } from "../PolyPong-Common/src/Game.ts";

const client = new MongoClient();

// Defining schema interface
interface UserSchema {
  _id: { $oid: string };
  username: string;
  email: string;
  wins: number;
  losses: number;
  paddleColor: Color;
  xp: number;
}
await client.connect("mongodb://0.0.0.0:27017");

const db = client.database("polypong");
const users = db.collection<UserSchema>("users");

const deleteCount2 = await users.deleteMany({});

await users.createIndexes(
  {
    indexes: [
      {
        key: {
          username: 1,
        },
        name: "usernames",
        unique: true
      },
      {
        key: {
          email: 1,
        },
        name: "emails",
        unique: true
      }
    ],
  },
);

const getAvailableSkins = async (username: string) => {
  const user = await getUser(username);
  if (!user) {
    return []
  }

  return Object
    .entries(ColorLevels)
    .filter(([k, v]) => v <= user.xp)
    .map(([k, v]) => k);

}

const setSkin = async (username: string, skin: Color) => {
  const user = await getUser(username);
  if (!user) {
    return "error";
  }

  if (user.xp < ColorLevels[skin]) {
    return "error"
  }

  return await users.updateOne({ username: { $eq: username } }, { $set: { paddleColor: skin } });
}

// this should be determined by the server, not the game client
const levelUp = async (username: string, levels: number) => {
  return await users.updateOne({ username: { $eq: username } }, { $inc: { xp: levels } });
}


const addUser: (username: string, email: string) => Document = async (
  username: string,
  email: string,
) => {
  const insertId = await users.insertOne({
    username,
    email,
    wins: 0,
    losses: 0,
    paddleColor: Color.White,
    xp: 0,
  });
  return insertId;
};

const checkExists = async (field: string, str: string) => {
  const query = { [field]: str };
  console.log(query);
  console.log(await users.findOne({ [field]: str }));

  return !!(await users.findOne({ [field]: str }));
};


const getUser = async (username: string) => {
  return await users.findOne({ username: { $eq: username } }, { projection: { _id: 0 } });
};

const getXP = async (username: string) => {
  const result = await users.findOne({ username: { $eq: username } }, { projection: { _id: 0, xp: 1 } })
  return result ? result.xp : -1
}

addUser("arun", "test@example.com");

const result = await getUser("arun");
console.log(result);


const arunsxp = await getXP("arun");
console.log(arunsxp);

const dbHelper = {
  checkExists,
  addUser,
  getUser,
  getXP,
};

export default dbHelper;