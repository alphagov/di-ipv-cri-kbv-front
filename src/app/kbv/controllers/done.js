const BaseController = require("hmpo-form-wizard").Controller;

const {
  API: {
    PATHS: { AUTHORIZATION_CODE },
  },
} = require("../../../lib/config");

class DoneController extends BaseController {
  async saveValues(req, res, callback) {
    super.saveValues(req, res, async (err, next) => {
      if (err) {
        next(err);
      }

      // try {
      //   const apiResponse = await req.axios.get(AUTHORIZATION_CODE, {
      //     headers: {
      //       sessionId: req.session.tokenId,
      //     },
      //   });
      //
      //   console.log(apiResponse);
      //
      //   const code = apiResponse?.data?.code?.value;
      //
      //   // if (!code) {
      //   //   res.status(500);
      //   //   return res.send("Missing authorization code");
      //   // }
      //
      //   req.session.authorization_code = code;

      // res.redirect("/oauth2/");
      // } catch (e) {
      //   callback(e);
      // }

      callback();
    });
  }
}

module.exports = DoneController;
