const mongoose = require("mongoose");

// Schema for tracking unique visitors
const visitorSchema = new mongoose.Schema({
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Visitor = mongoose.model("Visitor", visitorSchema);

const pageVisitSchema = new mongoose.Schema({
  pageName: { type: String, required: true },
  ipAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const PageVisit = mongoose.model("PageVisit", pageVisitSchema);

// Schema for recording page visits
const pageSchema = new mongoose.Schema({
  pageName: { type: String, required: true },
  visits: [{ type: mongoose.Schema.Types.ObjectId, ref: "PageVisit" }],
});

const Page = mongoose.model("Page", pageSchema);

// Schema for logging button clicks
const buttonClickSchema = new mongoose.Schema({

  buttonId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ButtonClick = mongoose.model("ButtonClick", buttonClickSchema);

module.exports = {
  Visitor,
  Page,
  PageVisit,
  ButtonClick,
};
