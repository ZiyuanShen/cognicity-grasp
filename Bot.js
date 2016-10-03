'use strict';

// Human keywords/endpoints
// 1) Report
// 2) Alerts
// 3) Subscribe
// 4) Unsubscribe

/**
 * A bot object manages conversation with users
 * @constructor
 * @param {object} config Configuration object
 * @param {object} ReportCard CogniCity Report Card object
 * @param {object} logger Configured instance of logger object from Winston module
 */
var Bot = function(
  config,
  report_card,
  logger
){

  this.config = config;
  this.report_card = report_card;
  this.logger = logger;
};


Bot.prototype = {

  /**
   * Configuration object
   * @type {config}
   */
   config: null,

  /**
   * Configured instance of pg object from pg module
   * @type {object}
   */
   db: null,

   /**
    * Configured instance of logger object from Winston module
    * @type {object}
    */
    logger: null,

    /**

    */

    cardAddress: function(card_id, callback){
      var self = this;
      if (!self.config.card_url_prefix){
        self.logger.error('[cardAddress] No card url prefix specified');
        return;
      }
      else {
        callback(self.config.card_url_prefix+'/'+card_id);
      }
    },

    /**
     * Function to parse user input and provide response based on keyword detection
     * @param {string} words Text string containing user input
     * @param {function} callback Callback function for Bot response
     */
    parse: function(words, callback){
      var self = this;
      switch (words.match(self.config.regex)){
        case  null:
          self.logger.info('Bot could not detect a keyword');
          break;
        default:
          self.logger.info('Bot requesting issue of card');
          // These callbacks could be neater
          self.report_card.issueCard(function(card_id){
            self.cardAddress(card_id, function(card_address){
              callback(card_address);
            });
          });
          break;
        }
      }
};

module.exports = Bot;