const User = require("../models/User");
//const bcrypt = require("bcryptjs");
module.exports = class AuthController {
  static login(req, res) {
    res.render("auth/login");
  }

  static async loginPost(req, res) {
    const { email, password } = req.body;

    // Find user
    //const user = await User.findOne({ where: { email: email } });

    if (!user) {
      req.flash("message", "User not found!");
      res.render("auth/login");
      return;
    }

    // Check password
    //const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      req.flash("message", "Invalid Password!");
      res.render("auth/login");
      return;
    }

    // initalize session
    req.session.userid = user.id;

    req.flash("message", "Successfully log in!");

    req.session.save(() => {
      res.redirect("/");
    });
  }

   static register(req, res) {
    res.render("auth/register");
  }

   static async registerPost(req, res) {
//     const { name, email, password, confirmpassword } = req.body;

//     //password validation
//     if (password != confirmpassword) {
//       req.flash("message", "The passwords do not match!");
//       res.render("auth/register");
//       return;
//     }

//     // check if user exists
//     const checkIfUserExists = await User.findOne({ where: { email: email } });

//     if (checkIfUserExists) {
//       req.flash("message", "This email is being used by someone else!");
//       res.render("auth/register");
//       return;
//     }

    // create user
    // const user = {
    //   name,
    //   email,
    //   password,
    // };

    // try {
    //   const createdUser = await User.create(user);

    //   // initalize session
    //   req.session.userid = createdUser.id;

    //   req.flash("message", "User created successfully!");

    //   req.session.save(() => {
    //     res.redirect("/");
    //   });
    // } catch (err) {
    //   console.log(err);
    // }
  }

  static logout(req, res) {
    req.session.destroy();
    res.redirect("/login");
  }
};
