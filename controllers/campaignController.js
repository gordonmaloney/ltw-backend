const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const Campaign = require("../models/campaignSchema");
const { db } = require("../models/campaignSchema");

//get all campaigns
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.status(200).json(campaigns);
  } catch {
    res.status(500).json("uh oh!");
  }
};

//get single campaign
const getCampaign = async (req, res) => {
  console.log(req.params);
  try {
    const { uuid    } = req.params;

    const campaign = await Campaign.findOne({ uuid: uuid });

    res.status(200).json(campaign);
  } catch {
    res.status(500).json("uh oh!");
  }
};

//create campaign
const createCampaign = async (req, res) => {
  const { uuid } = req.body;
  const campaign = await Campaign.findOne({ uuid: uuid });

  console.log(req.body)

  if (campaign) {
    res.status(500).json("Campaign name already in use");
  } else {
    try {
      const {
        title,
        blurb,
        host,
        hostLink,
        uuid,
        subject,
        target,
        bcc,
        channel,
        prompts,
        template,
        bulkTarget,
      } = req.body;

      const campaign = await Campaign.create({
        title,
        blurb,
        host,
        hostLink,
        uuid,
        subject,
        target,
        bcc,
        channel,
        prompts,
        template,
        bulkTarget,
      });

      console.log(req.body)
      console.log(campaign)
      res.status(200).json(campaign);
    } catch {
      res.status(500).json("uh oh!");
    }
  }
};

const editCampaign = async (req, res) => {
  const { uuid } = req.body;
  let campaign = await Campaign.findOne({ uuid: uuid });

  if (!campaign) {
    res.status(500).json("Campaign not found");
  } else {
    try {
      campaign.title = req.body.title;
      campaign.blurb = req.body.blurb;
      campaign.host = req.body.host;
      campaign.hostLink = req.body.hostLink;
      campaign.subject = req.body.subject;
      campaign.target = req.body.target;
      campaign.bcc = req.body.bcc;
      campaign.channel = req.body.channel;
      campaign.prompts = req.body.prompts;
      campaign.template = req.body.template;
      campaign.bulkTarget = req.body.bulkTarget;

      await campaign.save();

      res.status(200).json(campaign);
    } catch {
      res.status(500).json("uh oh!");
    }
  }
};

const deleteCampaign = async (req, res) => {
  const { uuid } = req.params;
  const campaign = await Campaign.findOne({ uuid: uuid });

  if (!campaign) {
    res.status(500).json("Campaign not found");
  } else {
    const campaign = await Campaign.findOneAndDelete({ uuid: uuid });
    res.status(200).json(`Campaign ${uuid} successfully deleted.`)
  }
};


module.exports = {
  getCampaigns,
  getCampaign,
  createCampaign,
  editCampaign,
  deleteCampaign,
};
