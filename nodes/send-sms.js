const axios = require('axios');
const replaceMsgPlaceholders = require('./utils/replace-msg-placeholders');
const smsPayload = require('./utils/sms-payload');

module.exports = function (RED) {
  function SendSMSNode(config) {
    RED.nodes.createNode(this, config);
    this.from = config.from;
    this.message = config.message;
    this.checkForDelivery = config.checkForDelivery;
    this.phoneNumberConfig = RED.nodes.getNode(config.to);
    this.tyntecConfig = RED.nodes.getNode(config.tyntecConfig);
    let node = this;

    node.on('input', async (msg, send, done) => {
      node.message = replaceMsgPlaceholders(node.message, msg);
      node.log(`Node message: ${node.message}`);

      const msgBody = smsPayload(node.from, node.phoneNumberConfig.phonenumber, node.message);

      let response;
      try {
        response = await axios.post('https://api.tyntec.com/conversations/v3/messages', msgBody, {
          headers: { apikey: node.tyntecConfig.apikey, 'x-tyntec-message-source': 'node-red' },
        });

        node.log('Message has been sent');
        node.log(`Response from API call: ${JSON.stringify(response.data)}`);

        node.status({ fill: node.checkForDelivery ? 'blue' : 'green', shape: 'dot', text: 'accepted' });
      } catch (error) {
        node.error(error);
        node.status({ fill: 'red', shape: 'ring', text: 'error' });
        return done(error);
      }

      // Check for successfull SMS delivery
      node.log(`Delivery check is set to: ${node.checkForDelivery}`);
      if (node.checkForDelivery) {
        const messageId = response.data.messageId;
        node.log(`Message ID: ${messageId}`);

        const checkStatus = async () => {
          let statusResponse;

          try {
            statusResponse = await axios.get(`https://api.tyntec.com/conversations/v3/messages/${messageId}/status`, {
              headers: { apikey: node.tyntecConfig.apikey, 'x-tyntec-message-source': 'node-red' },
            });
          } catch (error) {
            node.error(error);
            node.status({ fill: 'red', shape: 'ring', text: 'error in delivery check' });
            await done(error);
            return true;
          }

          let deliveryStatus = statusResponse.data.status;

          switch (deliveryStatus) {
            case 'delivered':
              node.log('SMS delivered');
              node.status({ fill: 'green', shape: 'dot', text: 'sms delivered' });
              return true;
            case 'failed':
              node.error(`SMS delivery failed with status "${deliveryStatus}"`);
              node.status({ fill: 'red', shape: 'dot', text: 'sending sms failed' });
              return true;

            default:
              return false;
          }
        };

        const checkUntilFinalDelivery = async () => {
          setTimeout(async () => {
            const isFinal = await checkStatus();
            if (!isFinal) {
              return await checkUntilFinalDelivery();
            }
            return;
          }, 1000);
        };

        await checkUntilFinalDelivery();
      }

      return done();
    });
  }
  RED.nodes.registerType('send-sms', SendSMSNode);
};
