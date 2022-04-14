const express = require("express");

const router = express.Router();

const {
  addAuthParamsToSession,
  addJWTToRequest,
  transposeJWT,
  initSessionWithJWT,
  redirectToCallback,
  redirectToKBV,
  retrieveAuthorizationCode,
} = require("./middleware");

router.get(
  "/authorize",
  addAuthParamsToSession,
  addJWTToRequest,
  transposeJWT,
  initSessionWithJWT,
  redirectToKBV
);
router.post("/authorize", retrieveAuthorizationCode, redirectToCallback);

module.exports = router;
