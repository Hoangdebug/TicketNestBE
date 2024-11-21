import express from "express";
const ctrls = require("../controller/favouriteController");
const router = express.Router();

router.post("/", ctrls.createFavourite);
router.get('/user/:userId', ctrls.getFavouritesByUserId);
router.delete("/:id", ctrls.deleteFavouriteById);

module.exports = router;
