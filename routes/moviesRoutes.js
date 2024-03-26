const express = require('express')
const router = express.Router()
const MovieController = require('../controllers/MovieController')

 
const checkAuth = require('../helpers/auth').checkAuth

router.get("/", MovieController.showRecomendedMovies)
router.get('/', MovieController.showMovies)
router.post("/", MovieController.watchMovie)

module.exports = router 