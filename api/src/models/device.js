const mongoose = require("mongoose");


const MODELNAME = "device";

const Schema = new mongoose.Schema({
  name: { type: String },
  hostname: { type: String },
  description: { type: String },

  from: { type: String },
  folder: { type: String },
  date: { type: Date },

  ping: { type: Date }, // last ping recorded

  status: { type: String },
  version: { type: String },
  cpu: { type: Number },
  mem: { type: Number },

  logs: { type: String },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
