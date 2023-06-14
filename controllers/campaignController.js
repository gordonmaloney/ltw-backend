const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const asyncHandler = require("express-async-handler");
const Campaign = require("../models/campaignSchema");
const { db } = require("../models/campaignSchema");

//get all campaigns
//get: /all
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.status(200).json(campaigns);
  } catch {
    res.status(500).json("uh oh!");
  }
};

//get single campaign
//get: /:uuid
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
//post: /
const createCampaign = async (req, res) => {
  const { uuid, password, ...campaignData } = req.body;
  const campaign = await Campaign.findOne({ uuid: uuid });


  if (campaign) {
    res.status(500).json("Campaign name already in use");
  } else {
    try {
      let hashedPassword;

      //hash pw if there is one
      //otherwise just make a random one and lock that sucka up like ancient treasure
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      } else {
        const randomPassword = randomstring.generate(10);
        hashedPassword = await bcrypt.hash(randomPassword, 10);
      }

      const createdCampaign = new Campaign({
        ...campaignData,
        uuid: uuid,
        password: hashedPassword,
      });
  
      await createdCampaign.save();
  
      return res.status(200).json(createdCampaign);
    } catch (error) {
      res.status(500).json("uh oh!" + error);
    }
  }
};

//post: /edit/:uuid
const editCampaign = async (req, res) => {
  const { uuid } = req.params;
  const { password, ...campaignData } = req.body;
  //note for frontend: we take the OLD uuid from req.params, but the NEW from req.body


  let campaign = await Campaign.findOne({ uuid: uuid });

  if (!campaign) {
    res.status(404).json("Campaign not found");
  } else {
    try {

      const passwordMatch = await bcrypt.compare(password, campaign.password);
      if (!passwordMatch) return res.status(401).json("Incorrect password");

      campaign.uuid = req.body.uuid
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

////post: /delete/:uuid
const deleteCampaign = async (req, res) => {
  const { uuid } = req.params;
  const campaign = await Campaign.findOne({ uuid: uuid });

  if (!campaign) {
    res.status(404).json("Campaign not found");
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
