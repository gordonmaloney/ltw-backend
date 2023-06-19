const express = require("express");
const { getCampaign, getCampaigns, createCampaign, logIn, editCampaign, deleteCampaign } = require("../controllers/campaignController");
const router = express.Router();


router.get('/all', getCampaigns)
router.get("/:uuid", getCampaign);

router.post("/", createCampaign);
router.post("/edit/:uuid", editCampaign);
router.post("/login", logIn);

router.post("/delete/:uuid", deleteCampaign);

module.exports = router;
