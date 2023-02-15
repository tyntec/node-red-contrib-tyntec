const deepValue = require('./deep-value');

const replaceMsgPlaceholders = function (nodeMessage, payloadMessage) {
  return nodeMessage.replace(/{{(.*?)}}/gm, (_placeholder, variable) => {
    const valName = variable.split(/\.(.*)/s);

    return deepValue(payloadMessage, valName[1]);
  });
};

module.exports = replaceMsgPlaceholders;
