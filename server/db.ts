import { MongoClient, Bson } from "https://deno.land/x/mongo@v0.21.0/mod.ts";

const client = new MongoClient();
await client.connect("mongodb://localhost:27017");

