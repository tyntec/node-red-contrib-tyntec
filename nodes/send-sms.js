const axios = require('axios');

module.exports = function (RED) {
  function SendSMSNode(config) {
    RED.nodes.createNode(this, config);
    this.from = config.from;
    this.message = config.message;
    this.phoneNumberConfig = RED.nodes.getNode(config.to);
    this.tyntecConfig = RED.nodes.getNode(config.tyntecConfig);
    let node = this;

    node.on('input', async (msg, send, done) => {
      // msg.payload = console.log(msg.payload, `username: ${node.credentials.username}`, `password: ${node.credentials.password}`);
      const msgBody = {
        from: node.from,
        to: node.phoneNumberConfig.phonenumber,
        content: { text: node.message, contentType: 'text' },
        channel: 'sms',
      };
      //axios.post("https://api.tyntec.com/messages/v1/sms", { from: node.from, to: node.to, message: msg.payload }, { headers: { apikey: node.credentials.apiKey } }).then((res) => {
      try {
        const response = await axios.post('https://api.tyntec.com/conversations/v3/messages', msgBody, {
          headers: { apikey: node.tyntecConfig.apikey },
        });
        this.log('Message has been sent');
        this.log(JSON.stringify(response.data));
        this.status({ fill: 'green', shape: 'ring', text: 'sent' });
        return send(msg);
      } catch (error) {
        this.status({ fill: 'red', shape: 'ring', text: 'error' });
        // throw error;
        done(error);
      }
    });
  }
  RED.nodes.registerType('send-sms', SendSMSNode);
};
