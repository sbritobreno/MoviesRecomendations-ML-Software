const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const flash = require("express-flash");

const app = express();

// Models
//const Movie = require("./models/Movie");
//const User = require("./models/User");

// Import Routes
//const moviesRoutes = require("./routes/moviesRoutes");
const authRoutes = require("./routes/authRoutes");

// Import Controllers
//const movieController = require("./controllers/movieController");

// template engine
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

// Body response
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// session middleware
app.use(
  session({
    name: "session",
    secret: "our_secret",
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      logFn: function () {},
      path: require("path").join(require("os").tmpdir(), "session"),
    }),
    cookie: {
      secure: false,
      maxAge: 360000,
      expires: new Date(Date.now() + 360000),
      httpOnly: true,
    },
  })
);

// flash messagees
app.use(flash());

// public path
app.use(express.static("public"));

// set session to res
app.use((req, res, next) => {
  if (req.session.userid) {
    res.locals.session = req.session;
  }

  next();
});

// Routes
//app.use("/thoughts", thoughtsRoutes);
app.use("/", authRoutes);

//app.get("/", thoughtController.showThoughts);

app.listen(3000, () => {
  console.log("App is running on port 3000");
});
