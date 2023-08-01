const { Articles, Users } = require("../db/dbConnector.js");

const mongoose = require("mongoose");

import { updateBoardWithArticle, createBoardForUser } from "../utils/mondayActions.js";

export const resolvers = {
  Query: {
    getArticles: async (root) => {
      try {
        return await Articles.find();
      } catch (error) {
        throw new Error("Failed to fetch articles");
      }
    },
    findArticle: async (root, { id }) => {
      try {
        return await Articles.findOne({ id: id });
      } catch (error) {
        throw new Error("Failed to fetch the article");
      }
    },
  },
  Mutation: {
    addArticle: async (root, { article }) => {
      try {
        // Verify the user's authentication using the accessToken
        // const user = await getAuthenticatedUser(_, { accessToken });

        // if (!user) {
        //   throw new Error("User not authenticated");
        // }

        // User is authenticated, proceed to add the article
        const newArticle = new Articles(article);
        const savedArticle = await newArticle.save();

        const user = await Users.findOne();

        await updateBoardWithArticle(user, savedArticle);

        return savedArticle;
      } catch (error) {
        throw new Error("Failed to add the article");
      }
    },
    updateArticle: async (_, { article, accessToken }) => {
      try {
        // Verify the user's authentication using the accessToken
        // const user = await getAuthenticatedUser(_, { accessToken });

        // if (!user) {
        //   throw new Error("User not authenticated");
        // }

        // User is authenticated, proceed to update the article

        const { id, ...updateData } = article;
        // Convert the id string to a MongoDB ObjectId
        const articleId = mongoose.Types.ObjectId(id);

        const updatedArticle = await Articles.findOneAndUpdate({ _id: articleId }, updateData, { new: true }).catch((error) => {
          console.error("Error updating the article:", error);
          throw new Error("Failed to update the article");
        });

        if (!updatedArticle) {
          throw new Error("Article not found");
        }
        // await updateBoardWithArticle(user.board_id, updatedArticle);

        return updatedArticle;
      } catch (error) {
        throw new Error("Failed to update the article");
      }
    },
    addUser: async (root, { user }) => {
      try {
        const newUser = new Users(user);
        return await newUser.save();
      } catch (error) {
        throw new Error("Failed to create the user");
      }
    },
    updateUser: async (root, { user }) => {
      try {
        const { accessToken, ...updateData } = user;

        // Find the user by their accessToken
        const foundUser = await Users.findOne({ accessToken });

        if (!foundUser) {
          throw new Error("User not found");
        }

        // Update the user with the new data
        Object.assign(foundUser, updateData);
        const updatedUser = await foundUser.save();

        return updatedUser;
      } catch (error) {
        throw new Error("Failed to update the user");
      }
    },
  },
};

async function getAuthenticatedUser(_, { accessToken }) {
  try {
    let user = await Users.findOne({ accessToken });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user already has a board ID
    if (!user.board_id) {
      // If not, create a new board for the user on Monday.com and save the board ID to the user document
      const board = await createBoardForUser(user);

      // Save the board ID to the user document
      user.board_id = board.id;
      await user.save();
    }

    return user;
  } catch (error) {
    throw new Error("Failed to fetch user data");
  }
}
