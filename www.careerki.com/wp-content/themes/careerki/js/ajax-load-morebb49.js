jQuery(function($){ // use jQuery code inside this to avoid "$ is not defined" error
	$('.careerki-loadmoreposts').click(function(){
 
		var button = $(this),
		    data = {
			'action': 'loadmoreposts',
			'query': careerki_loadmoreposts_params.posts, // that's how we get params from wp_localize_script() function
			'page' : careerki_loadmoreposts_params.current_page
		};
 
		$.ajax({ // you can also use $.post here
			url : careerki_loadmoreposts_params.ajaxurl, // AJAX handler
			data : data,
			type : 'POST',
			beforeSend : function ( xhr ) {
				button.text('কন্টেন্ট লোড হচ্ছে ...'); // change the button text, you can also add a preloader image
			},
			success : function( data ){
				if( data ) { 
					button.text( 'আরো কন্টেন্ট দেখুন' ).prev().before(data); // insert new posts
					careerki_loadmoreposts_params.current_page++;
 
					if ( careerki_loadmoreposts_params.current_page == careerki_loadmoreposts_params.max_page ) 
						button.remove(); // if last page, remove the button
 
					// you can also fire the "post-load" event here if you use a plugin that requires it
					// $( document.body ).trigger( 'post-load' );
				} else {
					button.remove(); // if no data, remove the button as well
				}
			}
		});
	});
});