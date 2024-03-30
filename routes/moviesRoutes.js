const express = require("express");
const router = express.Router();
const MovieController = require("../controllers/MovieController");

const checkAuth = require("../helpers/auth").checkAuth;

router.get("/", checkAuth, MovieController.showMovies);
router.get("/foryou", checkAuth, MovieController.showRecomendedMovies);

module.exports = router;
