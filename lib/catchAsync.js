module.exports = (fn) => {
  //console.log('module.exports = (fn) => {');
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
