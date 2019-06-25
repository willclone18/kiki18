var wpvqgr = wpvqgr || {};

(function($) 
{ 
	$(document).ready(function()
	{
		/**
		 * ------------------------
		 *   FACEBOOK API LOADER
		 * ------------------------
		 */
		
		wpvqgrLog('-- FACEBOOK API LOADER --');

		/**
		 * Facebook Async already loaded previously
		 */
	    if (typeof window.fbAsyncInit === 'function') 
	    {
			if (window.fbAsyncInit.hasRun === true) 
			{
	            wpvqgr.initFacebook();
	            wpvqgrLog('fbAsyncInit already fired, launch alone.');
	        } 
	        else 
	        {
	            var previousAsyncInit = window.fbAsyncInit;
	            window.fbAsyncInit = function () 
	            {
	                if (typeof previousAsyncInit === 'function') {
	                    previousAsyncInit();
	                    wpvqgrLog('Redefine fbAsyncInit.');
	                }
	                wpvqgr.initFacebook();
	            };
	        }
	    }

	    /**
	     * Facebook Async not loaded yet
	     */
	    else if (window.FB)
	    {
	    	wpvqgr.initFacebook(); // do something
	    	wpvqgrLog('fbAsynInit already fired.');
	    }

	    /**
	     * Facebook not loaded at all
	     */
	    else
	    {
	    	window.fbAsyncInit = function() {
	    		wpvqgr.initFacebook(); // do something
	            wpvqgrLog('Define fbAsyncInit from scratch.');
	    	}
	    }

		/**
		 * ------------------------
		 *   TWITTER API LOADER
		 * ------------------------
		 */
		
		$('.wpvqgr').on('click', '.wpvqgr-button.wpvqgr-social-twitter', function(e) 
		{
			var tweet 		=  $(this).attr('data-tweet');
			var mention 	=  $(this).attr('data-mention');
			var hashtag 	=  $(this).attr('data-hashtag');

			var url 		=  wpvqgr.getStore('url');

			window.open('http://twitter.com/share?via='+encodeURIComponent(mention)+'&hashtags='+encodeURIComponent(hashtag)+'&url='+encodeURIComponent(url)+'&text='+encodeURIComponent(tweet), '', 'left=0,top=0,width=600,height=300,personalbar=0,toolbar=0,scrollbars=0,resizable=0');

			// Trigger Custom Event
			$( document ).trigger( "wpvqgr-twitterShare", [ wpvqgr_quiz ] );
		});

	});

	/**
	 * Init the Facebook SDK properly
	 * @return {[type]} [description]
	 */
	wpvqgr.initFacebook = function() 
	{
		FB.init({
			appId      : wpvqgr_quiz.settings.global_facebook_appid, // App ID
			status     : true, // check login status
			cookie     : true, // enable cookies to allow the server to access the session
			xfbml      : true, // parse XFBML
			version    : 'v2.10'
		});

		if(typeof(FB) === "object" && FB._apiKey === null) {   
			wpvqgrLog('Error. Need to load FB properly.');
		} else {
			wpvqgrLog('wpvqgr runs well.');
		}

		// Trigger on FB Real Share Button
	    $('.wpvqgr').on('click', '.wpvqgr-button.wpvqgr-social-facebook', function(e) 
		{
			e.preventDefault();

			var forceToShare 	=  $(this).hasClass('wpvqgr-force-share');
			var askInfo			=  wpvqgr_quiz.settings.askinfo;

			// Get quiz data
			var title 			=  $(this).attr('data-title');
			var description 	=  $('<div/>').html($(this).attr('data-description')).text();
			var url 			=  wpvqgr.getStore('url');
			var picture 		=  wpvqgr.getStore('appreciation').picture;
			var quiz_id 		=  wpvqgr_quiz.general.id;

			// Define og:vars
			var og_vars 		= {};
			og_vars.url 		= url;
			og_vars.title 		= title;
			og_vars.description = description;
			if (typeof picture !== 'undefined' && picture != '') {
				og_vars.image 	= picture;
			} else {
				og_vars.image 	= $('meta[property="og:image"]:eq(0)').attr('content');
			}

			// API v2.10
			var fb_share_url = wpvqgr_fbshare_page_url + '&' + $.param(og_vars);
			var fb_param = {
				method: 'share',
				href: fb_share_url
			};

			// Logs Facebook Params
			wpvqgrLog(fb_share_url);
			wpvqgrLogObject(og_vars);
			
			// Share
			FB.ui(fb_param, function (response) 
			{
				if (forceToShare && response !== null && response !== 'undefined') 
				{
			    	wpvqgr.displayAskInformations();
			    	
			    	// Trigger Custom Event
					$( document ).trigger( "wpvqgr-facebookShare", [ wpvqgr_quiz ] );
				}
			});
		});

		// Trigger on FB Real Share Button
	    $('.wpvqgr').on('click', '.wpvqgr-button.wpvqgr-social-vk', function(e) 
		{
			e.preventDefault();

			// Get quiz data
			var title 			=  $(this).attr('data-title');
			var description 	=  $('<div/>').html($(this).attr('data-description')).text();
			var url 			=  wpvqgr.getStore('url');
			var picture 		=  wpvqgr.getStore('appreciation').picture;
			var quiz_id 		=  wpvqgr_quiz.general.id;

			// Define og:vars
			var og_vars 		= {};
			og_vars.url 		= url;
			og_vars.title 		= title;
			og_vars.description = description;
			if (typeof picture !== 'undefined' && picture != '') {
				og_vars.image 	= picture;
			}  else {
				og_vars.image 	= $('meta[property="og:image"]:eq(0)').attr('content')
			}
			
			var vk_share_url = wpvqgr_fbshare_page_url + '&' + $.param(og_vars);

			// Logs Facebook Params
			wpvqgrLog(vk_share_url);
			wpvqgrLogObject(og_vars);
			
			window.open("http://vk.com/share.php?url=" + vk_share_url);
		});
	}

})(jQuery);