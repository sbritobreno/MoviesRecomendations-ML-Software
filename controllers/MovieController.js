const req = require("express/lib/request");
const { getAllMovies } = require("../models/Movie");
const { getUser } = require("../models/User");

module.exports = class MoviesController {
  static async showRecomendedMovies(req, res) {
    const user = getUser(req.session.userid);
    const movies = getAllMovies();
    const moviesData = movies.slice(0, 10);

    res.render("movies/foryou", { moviesData, user });
  }

  static async showMovies(req, res) {
    const movies = getAllMovies();

    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }

    let moviesData = search
      ? movies.filter((movie) =>
          movie.Movie.toLowerCase().includes(search.toLowerCase())
        )
      : movies;

    // Order by rate
    if (req.query.rate === "good") {
      moviesData = moviesData.sort((a, b) => {
        return parseInt(b.AudienceScore) - parseInt(a.AudienceScore);
      });
    }
    if (req.query.rate === "bad") {
      moviesData = moviesData.sort((a, b) => {
        return parseInt(a.AudienceScore) - parseInt(b.AudienceScore);
      });
    }

    // Order by year
    if (req.query.year === "new") {
      moviesData = moviesData.sort((a, b) => {
        return parseInt(b.Year) - parseInt(a.Year);
      });
    }
    if (req.query.year === "old") {
      moviesData = moviesData.sort((a, b) => {
        return parseInt(a.Year) - parseInt(b.Year);
      });
    }

    // Filter by genre
    if (req.query.genre && req.query.genre != "All") {
      moviesData = moviesData.filter(
        (movie) => movie.Genre === req.query.genre
      );
    }

    let movieQty = moviesData.length;

    if (movieQty === 0) {
      movieQty = false;
    }

    res.render("movies/home", { moviesData, search, movieQty });
  }

  static async WatchMovie(req, res) {
    const movie = req.params.movie;
    console.log(movie);

    req.flash("message", "A new link was opened with the Movie :)");

    req.session.save(() => {
      res.redirect("/");
    });
  }
};
