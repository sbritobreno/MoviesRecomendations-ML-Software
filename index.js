const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const flash = require("express-flash");
const Handlebars = require("handlebars");
// Models
const { loadMoviesData } = require("./models/Movie");
const { loadUserData } = require("./models/User");

// Register the custom Handlebars helper
Handlebars.registerHelper("addOne", function (value) {
  return value + 1;
});

Handlebars.registerHelper("compare", function (value1, value2, options) {
  if (value1 === value2) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

const checkAuth = require("./helpers/auth").checkAuth;

const app = express();

// Import Routes
const moviesRoutes = require("./routes/moviesRoutes");
const authRoutes = require("./routes/authRoutes");

// Import Controllers
const movieController = require("./controllers/MovieController");

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
app.use("/movies", moviesRoutes);
app.use("/auth", authRoutes);

app.get("/", checkAuth, movieController.showMovies);

async function startServer() {
  await loadMoviesData();
  await loadUserData();

  app.listen(3000, () => {
    console.log("App is running on port 3000");
  });
}

startServer();
