const express = require('express')
const router = express.Router()
const MovieController = require('../controllers/MovieController')

 
const checkAuth = require('../helpers/auth').checkAuth

router.get('/', MovieController.showMovies)
router.get("/foryou", MovieController.showRecomendedMovies)

module.exports = router 