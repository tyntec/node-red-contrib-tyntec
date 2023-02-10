const axios = require('axios');

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
      node.message = node.message.replace(/{{(.*?)}}/gm, (_placeholder, variable) => {
        const valName = variable.split(/\.(.*)/s);

        const deepValue = function (obj, path) {
          for (let i = 0, newpath = path.split('.'), len = newpath.length; i < len; i++) {
            obj = obj[newpath[i]];
          }
          return obj;
        };

        return deepValue(msg, valName[1]);
      });

      const msgBody = {
        from: node.from,
        to: node.phoneNumberConfig.phonenumber,
        content: { text: node.message, contentType: 'text' },
        channel: 'sms',
      };
      node.log(`Message body: ${node.message}`);

      let response;
      try {
        response = await axios.post('https://api.tyntec.com/conversations/v3/messages', msgBody, {
          headers: { apikey: node.tyntecConfig.apikey },
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
              headers: { apikey: node.tyntecConfig.apikey },
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

        let intervalId;

        if (!intervalId) {
          intervalId = setInterval(async () => {
            const isFinal = await checkStatus();
            if (isFinal) {
              clearInterval(intervalId);
              intervalId = undefined;
            }
          }, 1000);
        }
      }

      return done();
    });
  }
  RED.nodes.registerType('send-sms', SendSMSNode);
};
