'use strict';

/**
 * A bot object manages conversation with users
 * @constructor
 * @param {object} config Configuration object
 * @param {object} dialogue Dialogue object with preformatted responses
 * @param {object} ReportCard CogniCity Report Card object
 * @param {object} logger Configured instance of logger object from Winston module
 */
var Bot = function(
  config,
  dialogue,
  report_card,
  logger
){

  this.config = config;
  this.dialogue = dialogue;
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
   * Dialogue object - preformatted replies to users
   * @type {object}
   */
   dialogue: null,

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

    _getDialogue: function(dialogue, language){
      var self = this;

      if (language in dialogue === false){language = self.config.default_language;}

      return (dialogue[language]);
    },

    /**
     * Function to create one time link address for report card_id
     * @param {string} card_id Unique card identifier
     * @param {function} callback Callback function for Bot response
     */
    _cardAddress: function(card_id, callback){
      var self = this;
      if (!self.config.card_url_prefix){
        self.logger.error('[cardAddress] No card url prefix specified');
        return callback('[cardAddress] No card url prefix specified', null);
      }
      else {
        callback(null, self.config.card_url_prefix+'/'+card_id);
      }
    },

    /**
     * Function to request report card and return appropriate bot response
     * @param {string} username Unique username e.g. @twitter
     * @param {string} words Text string containing user input
     * @param {string} language Text string containing ISO 639-1 two letter language code e.g. 'en'
     * @param {function} callback Callback function for Bot response
     */
    _requestCard: function(username, network, language, callback){
      var self = this;

      // local function bot text + card address
      var response = function(err, card_address){
        callback(err, self._getDialogue(self.dialogue.requests.card, language)+' '+card_address);
      };

      self.report_card.issueCard(username, network, language, function(err, card_id){
        if (err){
          self.logger.error('Bot encoutered error requesting card');
          callback(err, null);
        }
        else {
          self._cardAddress(card_id, response);
        }
      });
    },

    /**
     * Function to generate default bot response
     * @param {string} username Unique username e.g. @twitter
     * @param {string} language Text string containing ISO 639-1 two letter language code e.g. 'en'
     * @param {function} callback Callback function for Bot response
     */
    ahoy: function(username, language, callback){
      var self = this;

      callback(null, self._getDialogue(self.dialogue.ahoy, language));
    },

    /**
     * Function to parse user input and provide response based on keyword detection
     * @param {string} username Unique username e.g. @twitter
     * @param {string} words Text string containing user input
     * @param {string} language Text string containing ISO 639-1 two letter language code e.g. 'en'
     * @param {function} callback Callback function for Bot response
     */
    parseRequest: function(username, words, language, callback){
      var self = this;

      var filter = words.match(/banjir|flood/gi);
      if (filter){filter = filter[0];}

      switch (filter){
        case null:
          self.logger.info('Bot could not detect request keyword');
          self.ahoy(username, language, callback); // Respond with default
          break;

        case 'banjir':
          self.logger.info('Bot detected request keyword "banjir"');
          //self.report_card.issueCard(username, self.config.network.name, language, )
          self._requestCard(username, self.config.network.name, language, callback);
          break;

        case 'flood':
          self.logger.info('Bot detected request keyword "flood"');
          self._requestCard(username, self.config.network.name, language, callback);
          break;
      }
    },

      /**
       * Function to watch reports table and confirm when report recieved
       * @param {function} callback Callback function for Bot response
       */
      confirm: function(callback){
        var self = this;

        self.report_card.watchCards(self.config.network.name, function(err, report){
          if (err){
            self.logger.error("Could not watch cards from Bot.js: " + err);
          } else {
            callback(err, report.username,
             self._getDialogue(self.dialogue.confirmation, report.language)+' '+self.config.map_url_prefix+'/'+self.config.instance_regions[report.report_impl_area]+'/'+report.report_id);
          }
        });
      }
};

module.exports = Bot;
