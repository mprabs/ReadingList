import express from "express";
import { ApolloServer } from "apollo-server-express";
import { resolvers } from "./data/resolvers.graphql";
import { typeDefs } from "./data/schema.graphql";
import { PORT } from "./config/config";

import monday from "../mondayInstance";
import jwt from "jsonwebtoken";
import { Users } from "./db/dbConnector";

require("dotenv").config();

/**
 * Create an Apollo server instance.
 */
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

/**
 * Create an express server and apply the Apollo Server middleware
 */
const app = express();
app.use(express.json());
server.start().then(() => {
  server.applyMiddleware({ app });
  app.listen({ port: PORT }, () => {
    console.log(`Server is running at http://localhost:${PORT}${server.graphqlPath}`);
  });
});

app.get("/", (req, res) => {
  console.log("Apollo GraphQL Express server is ready");
});

const redirect_uri = "https://7af9-2400-1a00-b060-6bf9-a8c6-32a6-3776-5308.ngrok-free.app";

app.get("/oauth-callback", async (req, res) => {
  const { code, state } = req.query;

  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const signInSecret = process.env.SIGNIN_SECRET;

  const { accountId, backToUrl } = jwt.verify(state, signInSecret);

  const token = await monday.oauthToken(code, clientId, clientSecret);

  const user = await new Users({ account_id: accountId, accessToken: token.access_token });

  user.save();

  res.redirect(backToUrl);
});

app.post("/article/:action", async (req, res) => {
  const eventData = req.body.payload;

  const token = req.header("Authorization");
  const secret = process.env.JWT_SECRET;

  try {
    const decodedToken = jwt.verify(token, secret);

    // Check if the token has expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp < currentTime) {
      throw new Error("Token has expired");
    }

    const expectedAudience = redirect_uri + "/article/" + req.params.action;

    if (decodedToken.aud !== expectedAudience) {
      throw new Error("Invalid token audience");
    }

    const user = await Users.findOne({ account_id: decodedToken.accountId });

    const {
      inboundFieldValues: { boardId, content, imageUrl, link, date },
    } = eventData;

    user.columns = {
      imageUrl: imageUrl,
      content: content,
      date: date,
      link: link,
    };

    user.board_id = boardId;

    await user.save();

    // Now, subscribe to webhook(s) for the user's boards
    // Use the monday.com API to register webhook subscriptions

    // Sample code to subscribe to a webhook for a board
    const targetUrl = eventData.webhookUrl; // Your webhook endpoint
    const webhookEvents = ["create_item", "update_item", "delete_item"]; // List of events to subscribe to

    // createWebhookSubscription(boardId, targetUrl, webhookEvents, eventData.columnId, eventData.columnValue);

    res.json({ webhookId: generateWebhookId() });
  } catch (error) {
    res.status(500).send("Error subscribing to integration");
  }
});

app.post("/webhooks", (req, res) => {
  // Handle the incoming webhook event here
  const eventData = req.body;

  if (eventData.type === "install") {
    // Handle the installation event
  }

  // Send a response to acknowledge receipt of the event
  res.status(200).json({ success: true });
});

const generateWebhookId = () => {
  const timestamp = new Date().getTime();
  const randomChars = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${randomChars}`;
};

app.get("/auth", (req, res) => {
  const token = req.query;
  const clientId = process.env.CLIENT_ID;
  res.redirect(`https://auth.monday.com/oauth2/authorize?client_id=${clientId}&state=${token.token}`);
});
