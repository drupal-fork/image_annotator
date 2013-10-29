(function ($) {
  Drupal.behaviors.imageAnnotatorPopup = {
    attach: function (context, settings) {
	  $(context).bind('imageAnnotatorTargetLoaded', function(e) {
		// Let's find the annotators:
  	  $('.image-annotator-target').each(function (index, span) {
        $(this).find('span[class^="image-annotator"]').each(function(i, element) {
          var id = $(this).attr('id').split('__');
     	    var number = parseInt(id[2]) + 1;
    		  var tipContent = $(this).parents('.node').find('.image-annotator-item-' + number).html();
          $(this).qtip({
              content: {
                text: tipContent
              },
              hide: {
                delay: 400,
                fixed: true
              }
          });
          $(this).parents('.node').find('.image-annotator-item').css('display', 'none');
        })
	    });
	  });
    }
  };
})(jQuery);