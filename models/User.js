const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");

const users = [];

function loadUserData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, "..", "data", "users.csv"))
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", (data) => {
        users.push(data);
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", () => {
        console.log(`${users.length} users found!`);
        resolve();
      });
  });
}

function getAllUsers() {
  return users;
}

function getUser(id) {
  // Find user
  const user = users.find((user) => user.Id == id);
  return user;
}

module.exports = {
  loadUserData,
  getAllUsers,
  getUser,
};
