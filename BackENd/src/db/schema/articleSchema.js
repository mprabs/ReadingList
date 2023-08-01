"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.articleSchema = void 0;
const mongoose = require("mongoose");
exports.articleSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  content: {
    type: String,
  },
  url: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  date: {
    type: String,
  },
});
