var wpvqgr = wpvqgr || {};

(function($) 
{
	$(document).ready(function() 
	{
		wpvqgr.selectAnswer = function($question, question_id, $answer, answer_id)
		{
			// Don't let the user play twice the same question!
			if ($answer.hasClass('wpvqgr-disabled-answer') && !wpvqgr_quiz.settings.trivia_hiderightwrong) {
				return;
			}

			// Store data
			var _answers = wpvqgr.getStore('answers') || { 'questions' : [] };
			_answers.questions[question_id] = { 
				'answer_id' 	: answer_id,
				'multipliers'   : []
			};

			// Store raw multipliers
			$answer.find('input[name^=wpvqgr_answer_multipliers]').each(function(index)
			{
				var p_id 	=  parseInt($(this).attr('data-pid'));
				var value 	=  parseInt($(this).val());

				_answers.questions[question_id].multipliers[p_id] = value;
			});
			
			wpvqgr.setStore('answers', _answers);

			// Select answer
			$question.find('.wpvqgr-answer').removeClass('wpvqgr-selected-answer');
			$question.find('.wpvqgr-answer').removeClass('wpvqgr-is-selected-answer');
			$answer.addClass('wpvqgr-selected-answer');
			
			// Update visual checkbox
			$question.find('div.wpvqgr-checkbox-picture').removeClass('wpvqgr-checkbox-checked-picture');
			$answer.find('div.wpvqgr-checkbox-picture').addClass('wpvqgr-checkbox-checked-picture');

			// Not a visual class, just marked as
			$answer.addClass('wpvqgr-is-selected-answer');
		};

		wpvqgr.computeResults = function()
		{
			var answers 		=  wpvqgr.getStore('answers') || { 'questions' : [] };
			var finalScore  	=  new Array(); // {'p_id' => 0, 'score' => 12}, {'p_id' => 1, 'score' => 49}

			// Compute final personality
			$.each(answers.questions, function (q_id, answer_data) 
			{
				$.each(answer_data.multipliers, function (p_id, value) 
				{
					var key = _.findKey(finalScore, { 'p_id': p_id });
					if (typeof key == 'undefined') {
						key = finalScore.push({'p_id': p_id, 'score': 0});
						key--; // because .push returns number of elements, not last key
					}

					finalScore[key].score += value;
				});
			});

			finalScore.sort(function (a, b) {  return b.score - a.score;  });
			finalScore = finalScore.slice(0, wpvqgr_quiz.settings.perso_showpersonalities);

			// Appreciation
			var appreciations = wpvqgr.getAppreciations(finalScore);

			// Store global data for Facebook, page refresh and other stuff
			wpvqgr.setStore('finalScore', finalScore);
			wpvqgr.setStore('appreciation', appreciations[0]); // main result
			wpvqgr.setStore('appreciations', appreciations); // all results
		};

		/**
		 * Integrate results in view
		 * @return {[type]} [description]
		 */
		wpvqgr.integrateResults = function ()
		{
			var results 	=  wpvqgr.getStore('appreciations');
			var topResults 	=  results[0];
			results.shift();

			// Main results
			wpvqgr.parseResults('quizname', wpvqgr_quiz.general.name);
			wpvqgr.parseResults('personality', topResults['name']);
			wpvqgr.parseResults('description', topResults['content']);
			wpvqgr.parseResults('percentage', topResults['percentage']+'%');
			wpvqgr.parseResults('total', wpvqgr.getStore('answers').questions.length);

			// Additional results
			$.each(results, function(index, value)
			{
				var $emptyAdditionalResults = $('.wpvqgr .wpvqgr-additional-results .wpvqgr-additional-results-template').last();
				$emptyAdditionalResults.clone().insertAfter($emptyAdditionalResults);

				$emptyAdditionalResults.html($emptyAdditionalResults.html().replace('%%personality%%', value['name']));
				$emptyAdditionalResults.html($emptyAdditionalResults.html().replace('%%description%%', value['content']));
				$emptyAdditionalResults.html($emptyAdditionalResults.html().replace('%%total%%', value['total']));
				$emptyAdditionalResults.html($emptyAdditionalResults.html().replace('%%percentage%%', value['percentage']+'%'));

				$emptyAdditionalResults.show();
			});

			if (results.length > 0) {
				$('.wpvqgr .wpvqgr-additional-results').show();
			}
		}

		/**
		 * Fetch all the final appreciations, with their respective scores
		 * @param  {[type]} finalScore [description]
		 * @return {[type]}            [description]
		 */
		wpvqgr.getAppreciations = function(finalScore)
		{
			var appreciations = [];
			var totalScore 		=  _.sumBy(finalScore, 'score');

			$.each(finalScore, function (index, value) 
			{
				var p_id = value['p_id'];
				
				// Build the appreciation
				var _appreciation = [];
				_appreciation = wpvqgr_quiz.appreciations[p_id];
				_appreciation.percentage = Math.round(value.score * 100 / totalScore);

				appreciations.push(_appreciation);
			});

			return appreciations;
		};

		wpvqgr.getFinalScore = function()
		{
			return wpvqgr.getStore('appreciation').name;
		};

	});

})(jQuery);