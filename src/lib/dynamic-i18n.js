const _ = require("lodash");

function arrayify(value) {
  return [].concat(value || []);
}

module.exports = {
  buildOverrideTranslations(question) {
    const overrideTranslations = {
      fields: {
        question: {
          content: `${question.text}`,
          legend: `${question.questionID} - ${question.text}`,
          label: `${question.text}`,
          hint: `${question.tooltip}`,
          validation: {
            default: "You need to answer the question",
          },
          items: question.answerFormat.answerList.reduce((acc, answer) => {
            const answerKey = answer;

            acc[answerKey] = {
              label: `${_.capitalize(answer)}`,
              value: answer,
            };

            return acc;
          }, {}),
        },
      },
    };

    return overrideTranslations;
  },

  translateWrapper(originalTranslate, overrideTranslations) {
    return function (key, options) {
      if (typeof key === "string" && !key.startsWith("fields.question")) {
        return originalTranslate(key, options);
      }

      if (
        Array.isArray(key) &&
        !key.some((entry) => entry.startsWith("fields.question"))
      ) {
        return originalTranslate(key, options);
      }

      const keys = arrayify(key);

      const prop = keys.reduce((acc, value) => {
        return acc || _.get(overrideTranslations, value);
      }, "");

      return prop ? prop : originalTranslate(key, options);
    };
  },
};
