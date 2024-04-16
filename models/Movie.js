const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");

const movies = [];

function loadMoviesData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, "..", "data", "movies.csv"))
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", (data) => {
        movies.push(data);
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", () => {
        console.log(movies[1]);
        console.log(`${movies.length} movies found!`);
        resolve();
      });
  });
}

function getAllMovies() {
  return movies;
}

module.exports = {
  loadMoviesData,
  getAllMovies,
};
