const xssFilters = require("xss-filters");

function escapeStrings(obj) {
  for (let key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = xssFilters.inHTMLData(obj[key]);
    } else if (Array.isArray(obj[key])) {
      obj[key].forEach((item) => {
        if (typeof item === "string") {
          item = xssFilters.inHTMLData(item);
        } else if (typeof item === "object") {
          escapeStrings(item);
        }
      });
    } else if (typeof obj[key] === "object") {
      escapeStrings(obj[key]);
    }
  }
}

exports.escape = (req, res, next) => {
  req.body = escapeStrings(req.body);
  next();
};

exports.sanitizeXss = (req, res, next) => {
  // Sanitizar todas as queries
  for (const key in req.query) {
    req.query[key] = xssFilters.inHTMLData(req.query[key]);
  }

  // Sanitizar todas as entradas no corpo da requisição
  for (const key in req.body) {
    req.body[key] = xssFilters.inHTMLData(req.body[key]);
  }

  // Sanitizar todas as entradas nos parâmetros da URL
  for (const key in req.params) {
    req.params[key] = xssFilters.inHTMLData(req.params[key]);
  }

  next();
};
