const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const express = require('express');
const session = require('express-session');
const qs = require('qs');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const detectionRoutes = require('./routes/detectionRoutes');
const indexRoutes = require('./routes/indexRoutes');
const systemRoutes = require('./routes/systemRoutes');
const userRoutes = require('./routes/userRoutes');
const settingRoutes = require('./routes/settingRoutes');

const authMiddleware = require('./middleware/authMiddleware');
const expressLayouts = require('express-ejs-layouts');
const themesettings = require("./_themes/lib/themesettings.json");
const createThemeInstance = require("./_themes/lib/theme")
const createBootstrapInstance = require(`./views/layout/${themesettings.name}/bootstrap`)
const {hasPermission} = require("./utils/viewUtils");
const ObjectTypes = require("./utils/objectTypeUtils");
const {roles} = require("./utils/permissionUtils");
const Setting = require("./models/setting");
global.themesettings = themesettings;
const app = express();
require('dotenv').config();


const init = function (req, res, next) {
  global.theme = createThemeInstance();
  global.bootstrap = createBootstrapInstance();
  next()
}


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use(expressLayouts)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout/master')
app.set('query parser', (queryString) => {
  return qs.parse(queryString, { allowDots: true, arrayLimit: 100 });
});
app.use((req, res, next) => {
  app.locals.hasPermission = hasPermission;
  res.locals.ObjectTypes = ObjectTypes.ObjectTypes;
  res.locals.ObjectTypesInTurkish = ObjectTypes.ObjectTypesInTurkish;
  res.locals.roles = roles;
  next();
});

app.use(async (req, res, next) => {
  try {
    res.locals.settingData = await Setting.getApiData();
    next()
  } catch (error) {
    next(error)
  }
})

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(init);
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use('/auth', authRoutes);
app.use('/system', systemRoutes);
app.use('/setting', authMiddleware, settingRoutes);
app.use('/user', authMiddleware, userRoutes);
app.use('/dashboard', authMiddleware, dashboardRoutes);
app.use('/detection', authMiddleware, detectionRoutes);
app.use('/', indexRoutes);
app.use((req, res) => {
  res.redirect('/system/not-found');
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});


module.exports = app;