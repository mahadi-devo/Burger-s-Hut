function guest(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }

  return redirect('/');
}

module.exports = guest;
