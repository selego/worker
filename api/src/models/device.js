const mongoose = require("mongoose");

const MODELNAME = "device";

const Schema = new mongoose.Schema({
  name: { type: String },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
