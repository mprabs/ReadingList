"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const mongoose = require("mongoose");
exports.userSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  account_id: {
    type: String,
  },
  accessToken: {
    type: String,
  },
  board_id: {
    type: String,
  },
  columns: {
    imageUrl: {
      type: String,
    },
    content: {
      type: String,
    },
    date: {
      type: String,
    },
    link: {
      type: String,
    },
  },
});
