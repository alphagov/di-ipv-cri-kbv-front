const BaseController = require("hmpo-form-wizard").Controller;

const {
  API: {
    PATHS: { QUESTION },
  },
} = require("../../../lib/config");

class LoadQuestionController extends BaseController {
  async saveValues(req, res, next) {
    super.saveValues(req, res, async () => {
      try {
        const apiResponse = await req.axios.get(`${QUESTION}`, {
          headers: {
            "session-id": req.session.tokenId,
          },
        });

        req.session.question = apiResponse.data;
      } catch (e) {
        return next(e);
      }

      next();
    });
  }
}
module.exports = LoadQuestionController;
