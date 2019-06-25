jQuery(function($){
	$('#filter').submit(function(){
		var filter = $('#filter');
		$.ajax({
			url:filter.attr('action'),
			data:filter.serialize(), // form data
			type:filter.attr('method'), // POST
			beforeSend:function(xhr){
				filter.find('button').text('কন্টেন্ট লোড হচ্ছে...'); // changing the button label
			},
			success:function(data){
				filter.find('button').text('ফিল্টার করুন'); // changing the button label back
				$('#filtered-results').html(data); // insert data
			}
		});
		return false;
	});
});