const smsPayload = function (from, to, message) {
  return {
    from,
    to,
    content: { text: message, contentType: 'text' },
    channel: 'sms',
  };
};

module.exports = smsPayload;
