import {
  Bson,
  Document,
  MongoClient,
} from "https://deno.land/x/mongo@v0.22.0/mod.ts";

const client = new MongoClient();

// todo import from polypong-common
enum Paddle {
  White,
  Red,
  Green,
  Blue,
}

// Defining schema interface
interface UserSchema {
  _id: { $oid: string };
  username: string;
  email: string;
  wins: number;
  losses: number;
  paddle: Paddle;
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

const addUser: (username: string, email: string) => Document = async (
  username: string,
  email: string,
) => {
  const insertId = await users.insertOne({
    username,
    email,
    wins: 0,
    losses: 0,
    paddle: Paddle.White,
    xp: 0,
  });
  return insertId;
};

const getUser = async (username: string) => {
  return await users.findOne({username: {$eq: username}}, {projection: {_id: 0}});
};

const getXP = async (username: string) => {
    const result = await users.findOne({username}, {projection: {_id: 0, xp: 1}})
    return result ? result.xp : -1
}

addUser("arun", "test@example.com");

const result = await getUser("arun");
console.log(result);


const arunsxp = await getXP("arun");
console.log(arunsxp);
