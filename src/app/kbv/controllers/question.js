const dynamicTranslate = require("../../../lib/dynamic-i18n");
const BaseController = require("hmpo-form-wizard").Controller;

const debug = require("debug")("app:simplified:question:ctrl");

const {
  API: {
    PATHS: { QUESTION, ANSWER },
  },
} = require("../../../lib/config");

class QuestionController extends BaseController {
  configure(req, res, next) {
    debug(req.session?.scenarioID);
    debug(req.modelOptions());

    // debug(this.options);
    // debug(req.form.options);
    // debug(req.form.options.translate);
    // debug(req.translate);
    debug(Object.keys(req.session));
    debug(req.session.question);

    const overrideTranslations = dynamicTranslate.buildOverrideTranslations(
      req.session.question
    );

    req.form.options.fields.question = {
      label:
        overrideTranslations?.fields?.question?.legend ||
        req.session.question.text,
      type: "radios",
      validate: ["required"],
      fieldset: {
        legend: {
          text: `fields.questionX.legend`,
        },
      },
      items: req.session.question.answerFormat.answerList.map(
        // (answer) => `answer-${answer.replaceAll(/[^a-z0-9]*/gi, "")}`

        (answer) => answer
      ),
    };

    debug(overrideTranslations);

    req.form.options.translate = dynamicTranslate.translateWrapper(
      req.translate,
      overrideTranslations
    );

    super.configure(req, res, next);
  }
  locals(req, res, callback) {
    super.locals(req, res, (err, locals) => {
      if (err) {
        return callback(err, locals);
      }
      locals.question = req.session.question;

      callback(err, locals);
    });
  }

  async saveValues(req, res, callback) {
    super.saveValues(req, res, async (err, next) => {
      if (err) {
        next(err);
      }

      try {
        await req.axios.post(
          ANSWER,
          {
            questionId: req.session.question.questionID,
            answer: req.sessionModel.get("question"),
          },
          {
            headers: {
              "session-id": req.session.tokenId,
            },
          }
        );

        req.session.question = undefined;

        const nextQuestion = await req.axios.get(QUESTION, {
          headers: {
            "session-id": req.session.tokenId,
          },
        });

        if (nextQuestion.data) {
          req.session.question = nextQuestion.data;
        }
      } catch (e) {
        callback(e);
      }

      callback();
    });
  }

  next(req) {
    if (req.session.question) {
      return "question";
    }

    return "done";
  }
}
module.exports = QuestionController;
