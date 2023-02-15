const deepValue = function (obj, path) {
  for (let i = 0, newpath = path.split('.'), len = newpath.length; i < len; i++) {
    obj = obj[newpath[i]];
  }
  return obj;
};

module.exports = deepValue;
