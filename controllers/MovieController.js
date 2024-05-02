const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { getAllMovies } = require("../models/Movie");
const { getUser } = require("../models/User");

module.exports = class MoviesController {
  static async showRecomendedMovies(req, res) {
    const userId = req.session.userid;
    let user = getUser(userId);

    if (req.query.mood && user && req.query.mood[0] != user.Mood) {
      user = await updateUserMood(user.Id, req.query.mood[0]);
    }

    let upcomingMovies = false;
    if (req.query.upcomingMovies) {
      upcomingMovies = req.query.upcomingMovies == "on" ? true : false;
    }

    // Define Python script arguments
    const args = [JSON.stringify(user), upcomingMovies.toString()];

    // Spawn a child process to execute the Python script
    const pythonProcess = spawn("python", ["./ML-Model/ml-model.py", ...args]);

    // Listen for output from the Python script
    pythonProcess.stdout.on("data", (data) => {
      try {
        const recommendedMovies = data
          .toString()
          .split("\n")
          .filter((entry) => entry.trim() !== "")
          .map((entry) => {
            const [movie, genre, year, rate, compositeScore, id] =
              entry.split(/\s{2,}/);
            return {
              Movie: movie.trim(),
              Genre: genre.trim(),
              Year: parseInt(year.trim()),
              Rate: parseInt(rate.trim()),
              CompositeScore: parseFloat(compositeScore.trim()),
              Id: parseInt(id.trim()),
            };
          });

        res.render("movies/foryou", {
          moviesData: recommendedMovies,
          user,
          upcomingMovies,
        });
      } catch (error) {
        console.error("Error parsing recommended movies data:", error);
        console.error("Data received from Python process:", data.toString());
      }
    });

    // Listen for errors from the Python script
    pythonProcess.stderr.on("data", (data) => {
      console.error(`Error executing Python script: ${data}`);
      res.status(500).send("Error executing Python script");
    });

    // Handle process exit
    pythonProcess.on("close", (code) => {
      console.log(`Python script exited with code ${code}`);
    });
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
    const movieId = req.params.movie;
    const userId = req.session.userid;
    const movies = getAllMovies();
    const user = getUser(userId);
    const movie = movies.find((el) => el.Id === movieId);

    if (movie.Year == 2014) {
      req.flash("message", "This Movie was not released yet!");
    } else {
      if (user && !user.MoviesWatched.includes(movieId * 1)) {
        await updateUserData(userId, movie);
      }
      req.flash("message", "A new link was opened with the Movie :)");
    }

    req.session.save(() => {
      res.redirect("/");
    });
  }
};

async function updateUserData(userId, movie) {
  try {
    const data = await fs.promises.readFile(
      path.join(__dirname, "..", "data", "users.json"),
      "utf8"
    );
    const users = JSON.parse(data);
    const updatedUsers = users.map((user) => {
      if (user.Id == userId) {
        user.MoviesWatched.push(movie.Id * 1);
      }
      return user;
    });

    await fs.promises.writeFile(
      path.join(__dirname, "..", "data", "users.json"),
      JSON.stringify(updatedUsers, null, 2)
    );
  } catch (error) {
    throw error;
  }
}

async function updateUserMood(userId, newMood) {
  try {
    const data = await fs.promises.readFile(
      path.join(__dirname, "..", "data", "users.json"),
      "utf8"
    );
    const users = JSON.parse(data);
    const updatedUsers = users.map((user) => {
      if (user.Id == userId) {
        user.Mood = newMood;
      }
      return user;
    });
    await fs.promises.writeFile(
      path.join(__dirname, "..", "data", "users.json"),
      JSON.stringify(updatedUsers, null, 2)
    );

    const updatedUser = updatedUsers.find((user) => user.Id === userId);
    return updatedUser;
  } catch (error) {
    throw error;
  }
}
