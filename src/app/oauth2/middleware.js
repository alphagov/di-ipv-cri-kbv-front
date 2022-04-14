const debug = require("debug")("app:oauth:middleware");
const jwt = require("jsonwebtoken");

const {
  API: {
    PATHS: { AUTHORIZE, AUTHORIZATION_CODE },
  },
  APP: {
    PATHS: { KBV },
  },
} = require("../../lib/config");

module.exports = {
  addAuthParamsToSession: async (req, res, next) => {
    const authParams = {
      response_type: req.query.response_type,
      client_id: req.query.client_id,
      state: req.query.state,
      redirect_uri: req.query.redirect_uri,
    };

    req.session.authParams = authParams;

    next();
  },

  addJWTToRequest: (req, res, next) => {
    req.jwt = req.query?.request;
    next();
  },

  transposeJWT: async (req, res, next) => {
    debug(req.jwt);
    const decodedJWT = jwt.decode(req.query?.request, "ssh", {
      algorithms: ["none"],
    });

    debug(JSON.stringify(decodedJWT, null, 2));

    // New JWT format
    if (decodedJWT.claims.vc_http_api.UKAddresses) {
      debug("transposing");
      const transposedJWT = {
        sub: decodedJWT.sub,
        iss: decodedJWT.iss,
        iat: decodedJWT.iat,
        claim: {
          vc_http_api: {
            addresses: [
              {
                houseNumber:
                  decodedJWT.claims.vc_http_api.UKAddresses[0].street1,
                street: decodedJWT.claims.vc_http_api.UKAddresses[0].street2,
                postcode: decodedJWT.claims.vc_http_api.UKAddresses[0].postCode,
                addressType: decodedJWT.claims.vc_http_api.UKAddresses[0]
                  .currentAddress
                  ? "CURRENT"
                  : "PREVIOUS",
                townCity: decodedJWT.claims.vc_http_api.UKAddresses[0].townCity,
              },
            ],
            firstName: decodedJWT.claims.vc_http_api.names[0].firstName,
            surname: decodedJWT.claims.vc_http_api.names[0].surname,
            ipv_session_id: "C0DE",
            title: ".",
            dateOfBirth: decodedJWT.claims.vc_http_api.datesOfBirth[0],
          },
        },
      };

      req.jwt = jwt.sign(transposedJWT, "sssh", {});

      debug(req.jwt);
    }

    next();
  },

  initSessionWithJWT: async (req, res, next) => {
    debug("initSessionWithJWT");
    const requestJWT = req.jwt;
    const headers = { client_id: req.query?.client_id };

    try {
      if (requestJWT) {
        debug({
          params: {
            request: requestJWT,
          },
          headers: headers,
        });
        const apiResponse = await req.axios.post(
          AUTHORIZE,
          {},
          {
            params: {
              request: requestJWT,
            },
            headers: headers,
          }
        );

        debug("----------");

        debug(apiResponse);

        req.session.tokenId = apiResponse?.data["session-id"];
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
    next();
  },

  retrieveAuthorizationCode: async (req, res, next) => {
    try {
      const oauthParams = {
        ...req.session.authParams,
        scope: "openid",
      };

      const apiResponse = await req.axios.get(AUTHORIZATION_CODE, {
        params: oauthParams,
        headers: {
          sessionId: req.session.tokenId,
        },
      });

      console.log(apiResponse);
      const code = apiResponse?.data?.code?.value;

      if (!code) {
        res.status(500);
        return res.send("Missing authorization code");
      }

      req.authorization_code = code;

      next();
    } catch (e) {
      next(e);
    }
  },

  redirectToCallback: async (req, res) => {
    const redirectURL = `${req.session.authParams.redirect_uri}?code=${req.authorization_code}&state=${req.session.authParams.state}`;

    res.redirect(redirectURL);
  },

  redirectToKBV: async (req, res) => {
    res.redirect(KBV);
  },
};
