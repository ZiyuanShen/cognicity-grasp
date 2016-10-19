// Config object
var config = {
  logger : {
    logDirectory : null,
    filename : 'cognicity-grasp',
    maxFileSize : 1024 * 1024 * 100,
    maxFiles : 10,
    level : 'debug'
  },
  bot : {
    regex: (/banjir|flood/gi),
    card_url_prefix: 'http://localhost:3000/report',
    network: {
      name: 'twitter'
    },
    location: {
      name: 'jakarta'
    }
  },
  pg: {
    conString: "postgres://postgres@localhost:5432/cognicity_grasp"
  }
};

module.exports = config;
