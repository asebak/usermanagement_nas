/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('home', {
    title: 'Home',
    env: {
      endpoint: process.env.NAS_NETWORK_ENDPOINT,
      chain: process.env.NAS_NETWORK_CHAINID
    }
  });
};
