const fs = require("fs");
const path = require("path");

let users = [];

function loadUserData() {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, "..", "data", "users.json"),
      "utf8",
      (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        users = JSON.parse(data);
        resolve();
      }
    );
  });
}

function getAllUsers() {
  return users;
}

function getUser(id) {
  const user = users.find((user) => user.Id == id);
  return user;
}

module.exports = {
  loadUserData,
  getAllUsers,
  getUser,
};
