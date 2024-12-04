const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
    bootstrap.init();
    bootstrap.initSystemLayout()
    next()
})

router.use((req, res, next) => {
   bootstrap.init();
   bootstrap.initSystemLayout()
   next()
 })

router.get("/error", (req, res) => {
  res.render(theme.getPageViewPath("system", "error"), {
    currentLayout: theme.getLayoutPath("system"),
  });
});

router.get("/not-found", (req, res) => {
  res.render(theme.getPageViewPath("system", "notFound"), {
    currentLayout: theme.getLayoutPath("system"),
  });
});
router.get("/permission-denied", (req, res) => {
    res.render(theme.getPageViewPath("system", "permissionDenied"), {
        currentLayout: theme.getLayoutPath("system"),
    });
});
module.exports = router;
