const User = require("../models/User");
const { getAllUsers } = require("../models/User");

module.exports = class AuthController {
  static login(req, res) {
    res.render("auth/login");
  }

  static async loginPost(req, res) {
    const users = getAllUsers();
    const { username, password } = req.body;

    // Find user
    const user = users.find((user) => user.Username == username);

    if (!user) {
      req.flash("message", "User not found!");
      res.render("auth/login");
      return;
    }

    // Check password
    const passwordMatch = user.Password === password;

    if (!passwordMatch) {
      req.flash("message", "Invalid Password!");
      res.render("auth/login");
      return;
    }

    // initalize session
    req.session.userid = user.Id;

    req.flash("message", "Successfully log in!");

    req.session.save(() => {
      res.redirect("/");
    });
  }

  static register(req, res) {
    res.render("auth/register");
  }

  static async registerPost(req, res) {
  }

  static logout(req, res) {
    req.session.destroy();
    res.redirect("/auth/login");
  }
};
