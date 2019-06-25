var wpvqgr_store;
var wpvqgr = wpvqgr || {};

(function($) 
{ 
		/**
		 * Main events
		 */
		
		$(document).ready(function() 
		{
			wpvqgr.init();
			wpvqgr.hideLoader();

			if ((!wpvqgr_quiz.settings.startbutton || wpvqgr.getPageId() > 0) && !wpvqgr_results_only) {
				wpvqgr.startQuiz();
			} else if (wpvqgr_results_only) {
				wpvqgr.actionsBeforeResults();
			}

			wpvqgrLogObject(wpvqgr_quiz);
		});

		// Event: Choose answer
		$('.wpvqgr').on('click', '.wpvqgr-answer', function()
		{
			var $question 	 =  $(this).parent().closest('.wpvqgr-question');
			var question_id  =  parseInt($question.attr('data-id'));
			
			var $answer 	 =  $(this);
			var answer_id 	 =  parseInt($answer.attr('data-id'));

			var $page 		 =  $(this).parent().closest('.wpvqgr-page');
			var page_id 	 =  parseInt($page.attr('data-id'));

			wpvqgr.selectAnswer($question, question_id, $answer, answer_id);
			wpvqgr.moveOn($page, page_id, $question, question_id, $answer, answer_id);

			// Custom Trigger
			wpvqgr.triggerJs('answer');
		});

		// Event: Start quiz
		$('.wpvqgr-wrapper button.wpvqgr-start-button').click(function() {
			wpvqgr.startQuiz();
		});

		// Event: Continue button
		$('.wpvqgr-wrapper .wpvqgr-continue button.wpvqgr-button').click(function() {
			var $page = $(this).parent().closest('.wpvqgr-page');
			wpvqgr.goToNextPage($page);
		});

		// Event: Submit askInfo
		$('.wpvqgr-wrapper .wpvqgr-askinfo form').submit(function(e) 
		{
			e.preventDefault();

			var data 		=  {};
			var callback 	=  wpvqgr.displayResults;

			// Trigger Custom Event
			$( document ).trigger( "wpvqgr-askInfo", [ wpvqgr_quiz ] );

			wpvqgr.ajaxSaveInfo(data, callback);
		});

		// Event: Ignore askInfo
		$('.wpvqgr-wrapper .wpvqgr-askinfo p.wpvqgr-askinfo-ignore').click(function() {
			wpvqgr.displayResults();
		});

		// Event: Play Again
		$('.wpvqgr-wrapper button.wpvqgr-playagain').click(function() {
			wpvqgr.redirect(wpvqgr.getStore('url'));
		});


		/**
		 * Public Functions
		 */

		wpvqgr.init = function()
		{
			// Convert WP string to boolean
			wpvqgr_results_only = (wpvqgr_results_only == 'true');

			// Get session storage
			wpvqgr_store = store.namespace(wpvqgr_quiz.general.namespace);

			// Clean data when quiz restarts
			if (!wpvqgr_results_only && wpvqgr.getPageId() == 0) 
			{
				wpvqgr_store.clearAll();

				// Get the quiz URL for playAgain, share, ...
				wpvqgr.setStore('url', window.location.href);
			}

			if (wpvqgr_quiz.settings.randomanswers) {
				wpvqgr.shuffleAnswers();
			}
			
		};

		wpvqgr.startQuiz = function()
		{
			// Custom Trigger
			wpvqgr.triggerJs('start');

			// Display intro, first page, ...
			wpvqgr.displayCurrentPage();
			wpvqgr.updateProgressBar();
			$('.wpvqgr-wrapper .wpvqgr').show();
			$('.wpvqgr-wrapper .wpvqgr-loader').hide();
			$('.wpvqgr-wrapper .wpvqgr-intro').hide();

			// Trigger Custom Event
			$( document ).trigger( "wpvqgr-startQuiz", [ wpvqgr_quiz ] );
		};

		wpvqgr.moveOn = function($page, page_id, $question, question_id, $answer, answer_id)
		{
			if (wpvqgr.isPageOver($page)) 
			{
				if (wpvqgr_quiz.settings.forcecontinue) {
					$page.find('.wpvqgr-continue').last().show();
				}		
				else {
					wpvqgr.goToNextPage($page);
				}
			}
			else
			{
				if (wpvqgr_quiz.settings.autoscroll) {
					wpvqgr.scrollToNextQuestion($question);
				}
			}
		}

		wpvqgr.actionsBeforeResults = function()
		{
			// Hide all remaining "continue" buttons
			$('.wpvqgr-continue').hide();

			// Compute (and redirect if needed)
			if (!wpvqgr_results_only) 
			{
				wpvqgr.computeResults();

				// —— Redirect people (global redirection, or result-based redirection)
				var redirect_url = null;
				// ———— Result-based
				if (wpvqgr.getStore('appreciation').redirect != '') {
					redirect_url = wpvqgr.getStore('appreciation').redirect;
					redirect_url = updateQueryStringParameter(redirect_url, 'wpvqgr_id', wpvqgr_quiz.general.id);
				} 
				// ———— Global
				else if (wpvqgr_quiz.settings.redirect) {
					redirect_url = wpvqgr_results_url;
				}
				
				// ———> Move to URL
				if (redirect_url != null) {
					wpvqgr.showLoader();
					wpvqgr.redirect(redirect_url);	
					return;
				}
			}

			// Integrate results in view
			wpvqgr.integrateResults();

			// Results UX
			wpvqgr.displayForceToShare();
			// then -> displayAskInformations()
			// 	 then -> displayResults()
		};

		wpvqgr.displayForceToShare = function()
		{
			$('.wpvqgr').show(); // helpful for redirected results

			if (wpvqgr_quiz.settings.forcefacebook) {
				$('.wpvqgr-forcetoshare').show();
			} else {
				this.displayAskInformations();
			}
		};

		wpvqgr.displayAskInformations = function()
		{
			$('.wpvqgr-forcetoshare').hide();

			if (wpvqgr_quiz.settings.askinfo) {
				$('.wpvqgr-askinfo').show();
			} else {
				this.displayResults();
			}
		};

		wpvqgr.displayResults = function()
		{
			// Custom Trigger
			wpvqgr.triggerJs('end');

			// Ending Hook
			wpvqgr.ajaxEndQuiz(function(){});

			// Save Answers
			if (wpvqgr_quiz.settings.saveanswers) {
				wpvqgr.ajaxSaveAnswers(function(){});
			}

			wpvqgr_page++;
			wpvqgr.updateProgressBar();

			// Compute Results
			$('.wpvqgr-askinfo').hide();
			
			// Display results directly
			$('.wpvqgr-results').show();

			// Trigger Custom Event
			$( document ).trigger( "wpvqgr-endQuiz", [ wpvqgr_quiz ] );

		}

		/**
		 * Private functions
		 */
		
		// Change page
		wpvqgr.goToNextPage = function($page)
		{
			if (wpvqgr.isPageOver($page)) 
			{	
				// $Next_page : null if result, or a real $page
				var $next_page = wpvqgr.getNextPage($page);
				
				// Display result if quiz ended
				if ($next_page == null)
				{ 
					wpvqgr.actionsBeforeResults();

					// Hide last page
					$page.fadeOut(300, function() {
						if (wpvqgr_quiz.settings.autoscroll) {
							wpvqgr.scrollToResult();
						}
					});
				} 
				// Display next regular page
				else 
				{ 
					// Go to next page with a refresh
					if (wpvqgr_quiz.settings.refresh) {
						wpvqgr.redirect(wpvqgr_next_page_url);
						return;
					} 
					// Update the local counter and go on!
					else {
						wpvqgr_page++;
						$next_page.fadeIn(300);
					}
				

					// Hide previous page
					$page.fadeOut(300, function() {				
						if (wpvqgr_quiz.settings.autoscroll) {
							wpvqgr.scrollToNextPage($page);
						}
					});

				}

				// Progressbar++
				wpvqgr.updateProgressBar();
			}
		};

		wpvqgr.scrollToNextQuestion = function($currentQuestion)
		{
			var current_q_id 	=  $currentQuestion.attr('data-id');
			var next_q_id 		=  parseInt(current_q_id) + 1;
			var $nextQuestion 	=  $('.wpvqgr').find('.wpvqgr-question[data-id=' + next_q_id + ']');

			if ($nextQuestion !== "undefined") {
				$('html, body').animate( { scrollTop: $nextQuestion.offset().top - wpvqgr_quiz.settings.autoscroll_offset }, 700 );
			}
		};

		wpvqgr.scrollToResult = function()
		{
			var $resultArea = $('a#wpvqgr-resultarea');
			if ($resultArea !== "undefined") {
				$('html, body').animate( { scrollTop: $resultArea.offset().top - wpvqgr_quiz.settings.autoscroll_offset }, 700 );
			}
		};

		wpvqgr.scrollToNextPage = function($currentPage)
		{
			var $next_page 	=  wpvqgr.getNextPage($currentPage);	
			if ($next_page != null) {
				$('html, body').animate( { scrollTop: $next_page.offset().top - wpvqgr_quiz.settings.autoscroll_offset }, 700 );
			}
		};

		// Update the progressbar
		wpvqgr.updateProgressBar = function()
		{
			// No progressbar in town
			if (wpvqgr_quiz.settings.progessbar.length == 0) return;

			var current_page_id =  wpvqgr.getPageId();

			var $progressBars 	=  $('.wpvqgr-progress .progress-bar');
			var contentType 	=  wpvqgr_quiz.settings.progessbarcontent;

			// Compute progression
			if (wpvqgr_results_only) {
				var totalPages = wpvqgr.getStore('answers').questions.length;
				var percentage = 100;
			} else {
				var totalPages 		=  $('.wpvqgr-page').length;
				var percentage 		=  Math.floor(100 * (parseInt(current_page_id)) / totalPages);
			}
			

			// Manage content in bar
			var content = '';	
			if (contentType == 'percentage') {
				content = percentage + '%';
			} else if (contentType == 'counter') {
				content = current_page_id + '/' + totalPages;
			}

			$progressBars.css('width', percentage + '%');
			$progressBars.text(content);
		};
		
		// Toggle loading spinner
		wpvqgr.showLoader = function() {
			$('.wpvqgr-wrapper .wpvqgr-loader').show();
		};
		wpvqgr.hideLoader = function() {
			$('.wpvqgr-wrapper .wpvqgr-loader').hide();
		};

		// Storage (https://github.com/nbubna/store)
		wpvqgr.setStore = function(key, data) {
			return wpvqgr_store.session(key, data);
		}
		wpvqgr.getStore = function(key) {
			return wpvqgr_store.session.get(key);
		}

		// Int
		wpvqgr.countSelectedAnswers = function() {
			return this._getStore('answers').questions.length;
		}

		// Boolean
		wpvqgr.isPageOver = function($page) {
			var count_questions 		= $page.find('.wpvqgr-question').length;
			var count_selected_answer 	= $page.find('.wpvqgr-is-selected-answer').length;
			return (count_questions == count_selected_answer);
		}
		// Null or $next_page
		wpvqgr.getNextPage = function($current_page) 
		{
			var $next_page = $current_page.next('.wpvqgr-page');
			if ($next_page.length == 0) {
				return null;
			} else {
				return $next_page;
			}
		}

		// replace %%(tag)%% with (value) in the results box
		wpvqgr.parseResults = function(tag, value) 
		{
			var local_result  =  $('.wpvqgr-results .wpvqgr-results-box').html().replace('%%' + tag + '%%', wpvqgr.nl2br(value));
			$('.wpvqgr-results .wpvqgr-results-box').html(local_result);

			if (wpvqgr_quiz.settings.displaysharing)
			{
				// Facebook
				var $facebookButton = $('button.wpvqgr-button.wpvqgr-social-facebook, button.wpvqgr-button.wpvqgr-social-vk');
				if ($facebookButton.length > 0)
				{
					var facebook_title 			=  $facebookButton.attr('data-title').replace('%%' + tag + '%%', value);
					var facebook_description	=  $facebookButton.attr('data-description').replace('%%' + tag + '%%', value);

					$('button.wpvqgr-button.wpvqgr-social-facebook, button.wpvqgr-button.wpvqgr-social-vk').attr('data-title', facebook_title)
					$('button.wpvqgr-button.wpvqgr-social-facebook, button.wpvqgr-button.wpvqgr-social-vk').attr('data-description', facebook_description)
				}

				// Twitter
				var $twitterButton = $('button.wpvqgr-button.wpvqgr-social-twitter');
				if ($twitterButton.length > 0)
				{
					var twitter_tweet =  $twitterButton.attr('data-tweet').replace('%%' + tag + '%%', value);
					$('button.wpvqgr-button.wpvqgr-social-twitter').attr('data-tweet', twitter_tweet)
				}
			}
		}

		// Execute callback when over
		wpvqgr.ajaxSaveInfo = function(data, callback) 
		{
			$.post(wpvqgr_ajaxurl, {
	            'action': 'wpvqgr_add_user_info',
	            'wpvqgr_nounce': wpvqgr_nounce,
	            'data': $( ".wpvqgr-askinfo form" ).serialize(),
	            'quiz_id' : wpvqgr_quiz.general.id
	        }, callback);
		};

		// Execute callback when over
		wpvqgr.ajaxEndQuiz = function(callback) 
		{
			$.post(wpvqgr_ajaxurl, {
	            'action': 'wpvqgr_end_quiz',
	            'wpvqgr_nounce': wpvqgr_nounce,
	            'quiz_id' : wpvqgr_quiz.general.id,
	            'finalScore' : wpvqgr.getFinalScore()
	        }, callback);
		};

		wpvqgr.ajaxSaveAnswers = function(callback)
		{
			$.post(wpvqgr_ajaxurl, {
	            'action': 'wpvqgr_save_answers',
	            'wpvqgr_nounce': wpvqgr_nounce,
	            'quiz_id' : wpvqgr_quiz.general.id,
	            'quiz_questions' : wpvqgr_quiz.questions,
	            'user_answers' : wpvqgr.getStore('answers'),
	            'finalScore' : wpvqgr.getFinalScore()
	        }, callback);
		};

		// Manage page
		wpvqgr.displayCurrentPage = function() {
			$('.wpvqgr-wrapper .wpvqgr-page-' + wpvqgr.getPageId()).show();
		}

		wpvqgr.getPageId = function() {
			return wpvqgr_page - 1;
		}

		// Shuffle
		wpvqgr.shuffleAnswers = function() 
		{
			var $questions = $(".wpvqgr-question");
			$questions.each(function(index)
			{
				// take each answers via their div.col-md-* to shuffle the col
				var $answers = $(this).find('.wpvqgr-answer-col');

				// add each $answer in the .wpvqgr-question.row in a random order
			    while ($answers.length) 
			    {
			    	var randomFactor 	=  Math.random();
			    	var randomindex 	=  Math.floor(randomFactor * $answers.length);

			        $(this).find('.row').first().append($answers.splice(randomindex, 1)[0]);
			    }
			});
		}

		/**
		 * Redirect to an other URL (without history)
		 */
		wpvqgr.redirect = function(url)
		{
			var fakeLag = 0;
			setTimeout( function(){window.location.replace(url)}, fakeLag );
		}

		/**
		 * Eval Custom JS Code
		 * Event : start | end | answer
		 */
		wpvqgr.triggerJs = function(event)
		{
			var code = wpvqgr_quiz['settings']['ads_trigger_on' + event];
			try {
			    eval(code);
			} catch (e) {
			    if (e instanceof SyntaxError) {
			        window.wpvqgrLog(e.message);
			    } else {
			        throw( e );
			    }
			}
		}
 
		/**
		 * Snippets
		 */
		
		window.wpvqgrLog = function(message) {
			if (wpvqgr_log == 'on') {
				console.log('(WPVQGR) ' + message);
				// console.log('@' + window.wpvqgrLog.caller);
			}
		}

		window.wpvqgrLogObject = function(object) {
			if (wpvqgr_log == 'on') {
				console.log('(WPVQGR) ---- OBJECT ----' );
				console.log(object);
				console.log('(WPVQGR) ---- / ----' );
				// console.log('@' + window.wpvqgrLog.caller);
			}
		}

		/**
		 * Add a &key=value to a URI (with & or ? depending on the URI)
		 * @param  {[type]} uri   [description]
		 * @param  {[type]} key   [description]
		 * @param  {[type]} value [description]
		 * @return {[type]}       [description]
		 */
		window.updateQueryStringParameter = function(uri, key, value) 
		{
			var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
			var separator = uri.indexOf('?') !== -1 ? "&" : "?";
			if (uri.match(re)) {
				return uri.replace(re, '$1' + key + "=" + value + '$2');
			}
			else {
				return uri + separator + key + "=" + value;
			}
		}

		/**
		 * Create <br/> for new line
		 * @param  {[type]}  str      [description]
		 * @param  {Boolean} is_xhtml [description]
		 * @return {[type]}           [description]
		 */
		wpvqgr.nl2br = function (str, is_xhtml) {
		  // http://kevin.vanzonneveld.net
		  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		  // +   improved by: Philip Peterson
		  // +   improved by: Onno Marsman
		  // +   improved by: Atli Þór
		  // +   bugfixed by: Onno Marsman
		  // +      input by: Brett Zamir (http://brett-zamir.me)
		  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		  // +   improved by: Brett Zamir (http://brett-zamir.me)
		  // +   improved by: Maximusya
		  // *     example 1: nl2br('Kevin\nvan\nZonneveld');
		  // *     returns 1: 'Kevin<br />\nvan<br />\nZonneveld'
		  // *     example 2: nl2br("\nOne\nTwo\n\nThree\n", false);
		  // *     returns 2: '<br>\nOne<br>\nTwo<br>\n<br>\nThree<br>\n'
		  // *     example 3: nl2br("\nOne\nTwo\n\nThree\n", true);
		  // *     returns 3: '<br />\nOne<br />\nTwo<br />\n<br />\nThree<br />\n'
		  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

		  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
		}


})(jQuery);