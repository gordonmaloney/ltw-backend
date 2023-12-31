const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const Campaign = require("../models/campaignSchema");
const { db } = require("../models/campaignSchema");
const dotenv = require("dotenv");
dotenv.config();
const { initializeAnalyticsData } = require("./analyticsController");

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
  try {
    const { uuid } = req.params;

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
      if (password !== undefined) {
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
      await initializeAnalyticsData(uuid);

      return res.status(200).json(createdCampaign);
    } catch (error) {
      res.status(500).json("uh oh!" + error);
    }
  }
};

//post: /login/:uuid
const logIn = async (req, res) => {
  const { uuid } = req.body;
  const { password, adminPassword } = req.body;

  let campaign = await Campaign.findOne({ uuid: uuid });

  if (password && !adminPassword) {
    const passwordMatch = await bcrypt.compare(password, campaign.password);
    if (!passwordMatch) {
      return res.status(401).json("incorrect password");
    }
  } else if (adminPassword && adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json("incorrect admin password");
  }

  if (!password && !adminPassword) {
    return res.status(401).json("password required");
  }

  if (!campaign) {
    res.status(404).json("Campaign not found");
  } else {
    try {
      res.status(200).json(campaign);
    } catch {
      res.status(500).json("uh oh!");
    }
  }
};

//post: /edit/:uuid
const editCampaign = async (req, res) => {
  
  const { uuid } = req.params;
  const { oldPassword, password, adminPassword, ...campaignData } = req.body;
  //note for frontend: we take the OLD uuid from req.params, but the NEW from req.body

  let campaign = await Campaign.findOne({ uuid: uuid });

  if (oldPassword && !adminPassword) {
    const passwordMatch = await bcrypt.compare(oldPassword, campaign.password);
    if (!passwordMatch) {
      return res.status(401).json("incorrect password");
    }
  } else if (adminPassword && adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json("incorrect admin password");
  }

  if (!oldPassword && !adminPassword) {
    return res.status(401).json("password required");
  }

  if (!campaign) {
    res.status(404).json("Campaign not found");
  } else {
    try {
      campaign.uuid = req.body.uuid;
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

      if (req.body.password) {
        let hashedPassword;
        hashedPassword = await bcrypt.hash(password, 10);
        campaign.password = hashedPassword;
      }

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
  const { password, adminPassword } = req.body;

  let campaign = await Campaign.findOne({ uuid: uuid });

  if (password && !adminPassword) {
    const passwordMatch = await bcrypt.compare(password, campaign.password);
    if (!passwordMatch) {
      return res.status(401).json("incorrect password");
    }
  } else if (adminPassword && adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json("incorrect admin password");
  }

  if (!password && !adminPassword) {
    return res.status(401).json("password required");
  }

  try {
    const campaign = await Campaign.findOne({ uuid });

    if (!campaign) {
      return res.status(404).json("campaign not found");
    }

    await Campaign.findOneAndDelete({ uuid });
    res.status(200).json(`campaign ${uuid} successfully deleted`);
  } catch (error) {
    res.status(500).json("uh oh!");
  }
};

module.exports = {
  getCampaigns,
  getCampaign,
  createCampaign,
  logIn,
  editCampaign,
  deleteCampaign,
};
