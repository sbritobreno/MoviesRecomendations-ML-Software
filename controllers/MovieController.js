const req = require('express/lib/request')
// const Movies = require('../models/Movies')
const User = require('../models/User')


module.exports = class MoviesController{
    
    static async showRecomendedMovies(req, res){

    }

    static async showMovies(req, res){

        let search = ''


        res.render('movies/home', {movies, search})

        res.render('movies/home')
    }

    static async watchMovie(req, res){
        
    }

}