module.exports = function (RED) {
  function TyntecConfigNode(config) {
    RED.nodes.createNode(this, config);
    this.phonenumber = config.phonenumber;
  }
  RED.nodes.registerType('phone-number', TyntecConfigNode);
};
