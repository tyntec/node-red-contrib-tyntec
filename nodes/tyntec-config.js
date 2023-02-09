module.exports = function (RED) {
  function TyntecConfigNode(config) {
    RED.nodes.createNode(this, config);
    this.apikey = config.apikey;
  }
  RED.nodes.registerType('tyntec-config', TyntecConfigNode);
};
