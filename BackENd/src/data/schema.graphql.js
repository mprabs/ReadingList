import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Article {
    id: ID!
    title: String
    content: String
    url: String
    imageUrl: String
    date: String
  }

  type Query {
    getArticles: [Article]
    findArticle(id: ID!): Article
    getAuthenticatedUser(accessToken: String!): User
  }

  type Mutation {
    addArticle(article: ArticleInput!): Article
    addUser(user: UserInput!): User!
    updateArticle(article: UpdateArticleInput!): Article
    updateUser(user: UserInput!): User
  }

  input ArticleInput {
    title: String
    content: String
    url: String
    imageUrl: String
    date: String
  }

  input UpdateArticleInput {
    title: String
    content: String
    url: String
    imageUrl: String
    date: String
    id: ID!
  }
  type User {
    accessToken: String!
    board_id: String
  }
  input UserInput {
    accessToken: String!
  }
`;
