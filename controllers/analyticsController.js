const {
  Visitor,
  Page,
  ButtonClick,
  PageVisit,
} = require("../models/analyticsSchemas");
const Campaign = require("../models/campaignSchema");

const asyncLock = require("async-lock");
const lock = new asyncLock();

const initializeAnalyticsData = async (campaignUuid) => {
  console.log("initialising...");
  try {
    // Check if there is already analytics data for the campaign
    const existingAnalyticsData = await AnalyticsData.findOne({ campaignUuid });

    if (!existingAnalyticsData) {
      // If no analytics data exists, create a new document
      const analyticsData = new AnalyticsData({
        campaignUuid,
        pages: [],
      });
      await analyticsData.save();
    }
  } catch (error) {
    console.error(error);
  }
};

// Controller function for tracking daily unique visitors
const trackVisitor = async (req, res) => {
  try {
    const ipAddress = req.ip; // Retrieve the user's IP address from the request object
    const userAgent = req.headers["user-agent"]; // Retrieve the user agent from the request headers

    // Get the current date
    const currentDate = new Date().toLocaleDateString();

    // Check if visitor already exists for the current date
    let visitor = await Visitor.findOne({
      ipAddress,
      createdAt: { $gte: currentDate }, //$gte is the mongodb operator for 'greater than or equal to'
    });

    if (!visitor) {
      // Create a new visitor if not found
      visitor = new Visitor({ ipAddress, userAgent });
      await visitor.save();
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

// Controller function for recording page visits
const trackPageVisit = async (req, res) => {
  try {
    const { pageName } = req.body;
    const ipAddress = req.ip; // Retrieve the user's IP address from the request object

    // Get the current date (without the time portion)
    const currentDate = new Date().toLocaleDateString();

    // Find or create the page with the given pageName
    let page = await Page.findOne({ pageName }).populate("visits");

    if (!page) {
      // If the page doesn't exist, create a new page with an initial visit
      page = new Page({
        pageName: pageName,
        visits: [],
      });
    }

    // Check if the user's IP address has already visited the page today
    const existingVisit = page.visits.find(
      (visit) =>
        visit.ipAddress === ipAddress &&
        visit.createdAt.toLocaleDateString() === currentDate
    );

    console.log(existingVisit);

    if (!existingVisit) {
      // Create a new page visit and associate it with the page
      const pageVisit = new PageVisit({
        pageName: pageName,
        ipAddress: ipAddress,
      });
      await pageVisit.save();

      page.visits.push(pageVisit);
    }

    await page.save();

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

// Controller function for logging button clicks
const logButtonClick = async (req, res) => {
  try {
    const { buttonId } = req.body;

    // Create a new button click record
    const buttonClick = new ButtonClick({ buttonId });
    await buttonClick.save();

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

//master only
const getAnalyticsData = async (req, res) => {
  try {
    const { adminPassword } = req.body;

    if (adminPassword == process.env.ADMIN_PASSWORD) {
      // If admin password matches, fetch all analytics data
      const visitors = await Visitor.find().exec();
      const pages = await Page.find().populate("visits").exec();
      const buttonClicks = await ButtonClick.find().exec();

      res.status(200).json({ visitors, pages, buttonClicks });
    } else {
      // If admin password doesn't match, return unauthorized status
      res.sendStatus(401);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

//single camp analytics
const getCampaignAnalytics = async (req, res) => {
    try {
      const { uuid } = req.params;
  
      // Find the campaign by UUID
      const campaign = await Campaign.findOne({ uuid });
  
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
  
      // Retrieve all analytics data for the page with the matching UUID
      const pageAnalytics = await Page.find({ pageName: uuid }).populate('visits');

      const buttonClicks = await ButtonClick.find({ buttonId: uuid }, 'createdAt').exec();


      // Extract the necessary data from pageAnalytics
      const analyticsData = pageAnalytics.map((page) => {
        const { pageName, visits } = page;
        const formattedVisits = visits.map((visit) => {
          const { ipAddress, createdAt } = visit;
          return { ipAddress, createdAt };
        });
        return { pageName, visits: formattedVisits };
      });
  
      return res.status(200).json({...analyticsData[0], visits: [...analyticsData[0].visits, ...analyticsData[0].visits], sendClicks: buttonClicks});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to retrieve campaign analytics' });
    }
  };
  

//DANGER
const deleteAnalyticsData = async (req, res) => {
  try {
    const { adminPassword } = req.body;

    if (adminPassword == process.env.ADMIN_PASSWORD) {
      await Visitor.deleteMany();
      await Page.deleteMany();
      await ButtonClick.deleteMany();

      res.sendStatus(200);
    } else res.sendStatus(400);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

module.exports = {
  initializeAnalyticsData,
  logButtonClick,
  trackPageVisit,
  trackVisitor,
  getAnalyticsData,
  getCampaignAnalytics,
  deleteAnalyticsData,
};
