const authenticateAdminApiKey = (req, res, next) => {
    if(req.user.role !== 'admin') {
      return res.status(401).send('Unauthorized: Admin access only');
    }
    const apiKey = req.headers['api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return res.status(401).send('Unauthorized: Invalid API key');
    }
    next();
  };
module.exports = authenticateAdminApiKey;