import {
  Bson,
  Document,
  MongoClient,
} from "https://deno.land/x/mongo@v0.22.0/mod.ts";
import { Color, ColorLevels } from "../PolyPong-Common/src/Game.ts";

import {
  assertArrayIncludes,
  assertEquals,
  assertThrows
} from "https://deno.land/std/testing/asserts.ts";


// Database initialization
// FR1 User Login
// FR2 User Registration
// FR7 Earn XP
// FR8 Local Leaderboard
// FR9 Global Leaderboard
// FR10 User statistics
// FR27 Earn Skin
// FR28 Select skin
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

const DB_URL = Deno.env.get("MONGOURL") ?? "mongodb://localhost:27017";

console.log("mongo is at: ", DB_URL);

await client.connect(DB_URL);

const db = client.database("polypong");
const users = db.collection<UserSchema>("users");

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

// FR9 Global Leaderboard
export const getGlobalLeaderboard = async (limit = 10) => {
  const top10 = await users.find({}, { projection: { _id: 0, username: 1, xp: 1 } }).sort({ xp: -1 }).limit(limit).toArray()
  return top10;
}

// FR8 Local Leaderboard
export const getLocalLeaderboard = async (username: string, plusminus = 5) => {
  const xp = await getXP(username);
  if (!xp) {
    return []
  }
  const lessthanPromise = users.find({ xp: { $lt: xp } }, { projection: { _id: 0, username: 1, xp: 1 } }).sort({ xp: -1 }).limit(plusminus).toArray();
  const greaterthanProm = users.find({ xp: { $gt: xp } }, { projection: { _id: 0, username: 1, xp: 1 } }).sort({ xp: 1 }).limit(plusminus).toArray();
  const countPromise = users.count({ xp: { $gt: xp } });

  const [lessthan, greaterthan, count] = await Promise.all([lessthanPromise, greaterthanProm, countPromise])

  const position = count + 1;

  const user = {
    username,
    xp,
    position
  };

  const greater = greaterthan.map((e, i) => ({ ...e, position: i + 1 })).reverse().map(e => ({
    ...e,
    position: position - e.position
  }));

  const less = lessthan.map((e, i) => ({ ...e, position: position + i + 1 }))

  return [...greater, user, ...less];
}

// FR28 Select skin
export const getAvailableSkins: (username: string) => Promise<Color[]> = async (username: string) => {
  const user = await getUser(username);
  if (!user) {
    return []
  }

  return Object
    .entries(ColorLevels)
    .filter(([k, v]) => v <= user.xp)
    .map(([k, v]) => k as Color);
}

// FR28 Select skin
export const getSelectedSkin: (username: string) => Promise<Color> = async (username: string) => {
  const user = await getUser(username);
  if (!user) {
    return Color.White;
  }
  return user.paddleColor;
}

// FR28 Select skin
export enum setSkinResponse {
  UserNotFound,
  LevelTooLow,
  Success,
  ErrorUpdating
}

// FR28 Select skin
export const setSkin = async (email: string, skin: Color) => {
  const user = await getUserbyEmail(email)
  if (!user) {
    return setSkinResponse.UserNotFound
  }

  if (user.xp < ColorLevels[skin]) {
    return setSkinResponse.LevelTooLow
  }

  const result = await users.updateOne({ email: { $eq: email } }, { $set: { paddleColor: skin } });
  if (result) {
    return setSkinResponse.Success;
  }

  return setSkinResponse.ErrorUpdating;
}

// FR7 Earn XP
// this should be determined by the server, not the game client
export const levelUp = async (username: string, levels: number) => {
  return await users.updateOne({ username: { $eq: username } }, { $inc: { xp: levels } });
}

// FR10 User statistics
// this should be determined by the server, not the game client
export const addWin = async (username: string) => {
  return await users.updateOne({ username: { $eq: username } }, { $inc: { wins: 1 } });
}

// FR10 User statistics
// this should be determined by the server, not the game client
export const addLoss = async (username: string) => {
  return await users.updateOne({ username: { $eq: username } }, { $inc: { losses: 1 } });
}

// FR10 User statistics
export const getWins: (username: string) => Promise<number> = async (username: string) => {
  const user = await getUser(username);
  if (!user) {
    return -1;
  }
  console.log("The user exists, their wins are " + user.wins);
  return user.wins;
}

// FR10 User statistics
export const getLosses: (username: string) => Promise<number> = async (username: string) => {
  const user = await getUser(username);
  if (!user) {
    return -1;
  }
  console.log("The user exists, their losses are " + user.losses);
  return user.losses;
}

// FR2 User Registration
export const addUser: (username: string, email: string) => Document = async (
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

// FR2 User Registration
export const checkExists = async (field: "username" | "email", str: string) => {
  return !!(await users.findOne({ [field]: str }));
};

// FR10 User statistics
// FR28 Select skin
export const getUser = async (username: string) => {
  return await users.findOne({ username: { $eq: username } }, { projection: { _id: 0 } });
};

// FR28 Select skin
export const getUserbyEmail = async (email: string) => {
  return await users.findOne({ email: { $eq: email } }, { projection: { _id: 0 } });
}

// FR8 Local Leaderboard
// FR9 Global Leaderboard
// FR10 User statistics
export const getXP: (username: string) => Promise<number | undefined> = async (username: string) => {
  const result = await users.findOne({ username: { $eq: username } }, { projection: { _id: 0, xp: 1 } })
  return result?.xp
}

// tests
Deno.test("database test", async () => {

  // clean db for test
  await users.deleteMany({})

  // add user test
  addUser("arun", "test@example.com");

  const user = await getUser("arun");

  const expected = {
    username: "arun",
    email: "test@example.com",
    wins: 0,
    losses: 0,
    paddleColor: Color.White,
    xp: 0
  }
  assertEquals(user, expected);


  // check if user exists
  const exists = await checkExists("username", "arun");
  assertEquals(exists, true);

  const exists2 = await checkExists("email", "test@example.com");
  assertEquals(exists2, true);

  // check if user does not exist
  const doesntexist = await checkExists("username", "idontexist");
  assertEquals(doesntexist, false);

  // get xp
  const xp = await getXP("arun");

  // attempt to get xp for nonexistent user should throw
  const xp2 = await getXP("idontexist");
  assertEquals(xp2, undefined);


  // level up test
  const result = await levelUp("arun", 869);
  const user2 = await getXP("arun")
  assertEquals(user2, 869);


  // add win test
  await users.updateOne({ username: { $eq: "arun" } }, { $set: { wins: 122 } });
  await addWin("arun")
  const wins = await getWins("arun");
  assertEquals(wins, 123);
  assertEquals(await getWins("nonexistent"), -1);

  // add loss test
  await users.updateOne({ username: { $eq: "arun" } }, { $set: { losses: 245 } });
  await addLoss("arun");
  const loss = await getLosses("arun");
  assertEquals(loss, 246);
  assertEquals(await getLosses("nonexistent"), -1);
  // get available skins
  const available = await getAvailableSkins("arun")
  assertEquals(available, [Color.White, Color.BlueGrey, Color.Grey, Color.Brown, Color.DeepOrange, Color.Orange, Color.Amber, Color.Yellow, Color.Lime, Color.LightGreen, Color.Green, Color.Teal])

  // set skin
  const newskin = await setSkin("test@example.com", Color.DeepOrange);
  assertEquals(newskin, setSkinResponse.Success);

  // set skin that's not allowed yet because low xp
  const newskin2 = await setSkin("test@example.com", Color.Red);
  assertEquals(newskin2, setSkinResponse.LevelTooLow);

  // set skin user does not exist
  const setskin = await setSkin("thisuserdoesntexist", Color.DeepOrange);
  assertEquals(setskin, setSkinResponse.UserNotFound);


  // global leaderboard
  await addUser("first", "first@example.com")
  await addUser("second", "second@example.com")
  await addUser("third", "third@example.com")
  await addUser("fourth", "fourth@example.com")
  await addUser("fifth", "fifth@example.com")
  await addUser("sixth", "sixth@example.com")
  await addUser("seventh", "seventh@example.com")
  await addUser("eighth", "eighth@example.com")
  await addUser("ninth", "ninth@example.com")
  await addUser("tenth", "tenth@example.com")
  await addUser("11", "11@example.com")
  await addUser("12", "12@example.com")
  await addUser("13", "13@example.com")
  await addUser("14", "14@example.com")
  await addUser("15", "15@example.com")

  await levelUp("first", 1111111111)
  await levelUp("second", 222222222)
  await levelUp("third", 33333333)
  await levelUp("fourth", 4444444)
  await levelUp("fifth", 555555)
  await levelUp("sixth", 66666)
  await levelUp("seventh", 7777)
  await levelUp("eighth", 888)
  await levelUp("ninth", 887)
  await levelUp("tenth", 886)
  await levelUp("11", 885)
  await levelUp("12", 884)
  await levelUp("13", 883)
  await levelUp("14", 882)
  await levelUp("15", 881)


  const leaderboard = await getGlobalLeaderboard();
  const expectedgloballeaderboard = [
    { username: "first", xp: 1111111111 },
    { username: "second", xp: 222222222 },
    { username: "third", xp: 33333333 },
    { username: "fourth", xp: 4444444 },
    { username: "fifth", xp: 555555 },
    { username: "sixth", xp: 66666 },
    { username: "seventh", xp: 7777 },
    { username: "eighth", xp: 888 },
    { username: "ninth", xp: 887 },
    { username: "tenth", xp: 886 }
  ];
  assertEquals(leaderboard, expectedgloballeaderboard);

  const localleaderboard = await getLocalLeaderboard("seventh");
  const expectedlocalleaderboard = [
    { username: "second", xp: 222222222, position: 2 },
    { username: "third", xp: 33333333, position: 3 },
    { username: "fourth", xp: 4444444, position: 4 },
    { username: "fifth", xp: 555555, position: 5 },
    { username: "sixth", xp: 66666, position: 6 },
    { username: "seventh", xp: 7777, position: 7 },
    { username: "eighth", xp: 888, position: 8 },
    { username: "ninth", xp: 887, position: 9 },
    { username: "tenth", xp: 886, position: 10 },
    { username: "11", xp: 885, position: 11 },
    { username: "12", xp: 884, position: 12 }
  ];
  assertEquals(localleaderboard, expectedlocalleaderboard);


})

export default {
  getXP,
  getUser,
  getUserbyEmail,
  checkExists,
  addUser,
  levelUp,
  getAvailableSkins,
  getGlobalLeaderboard,
  getLocalLeaderboard,
  setSkin,
  getSelectedSkin,
  addWin,
  addLoss,
  getWins,
  getLosses,
}

export { users }