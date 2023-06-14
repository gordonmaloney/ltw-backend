const mongoose = require("mongoose");

const campaignSchema = mongoose.Schema(
  {
    title: String,
    blurb: String,
    host: String,
    hostLink: String,
    uuid: {
      type: String,
      unique: true
    },
    subject: String,
    target: Array,
    bcc: String,
    channel: String,
    prompts: Array,
    template: String,
    bulkTarget: String,
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("Campaign", campaignSchema);
