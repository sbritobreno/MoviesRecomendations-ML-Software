const req = require('express/lib/request')
const { getAllMovies } = require("../models/Movie");


module.exports = class MoviesController{
    static async showRecomendedMovies(req, res){
        
    }
    
    static async showMovies(req, res){
        const movies = getAllMovies()
        let search = ''


        res.render('movies/home', {movies, search})

        res.render('movies/home')
    }

    static async watchMovie(req, res){
        
    }

}