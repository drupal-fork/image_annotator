(function ($, Drupal, window, document, undefined) {
  var drag = function (pointer, dx, dy) {
    $(pointer).simulate("drag", {
      dx: dx || 0,
      dy: dy || 0
    });
  };
  Drupal.tests.iaRectangleDraggable = {
    getInfo: function() {
      return {
        name: Drupal.t('Image Annotator Rectangle Draggable'),
        description: Drupal.t('Test Image Annotator\'s draggable & resizable pointer widget'),
        group: Drupal.t('Image Annotator'),
        useSimulate: true
      }
    },
    tests: {
      addPointer: function ($, Drupal, window, document, undefined) {
        return function () {
          expect(2);
          $('.image-annotator-button').first().simulate('click');
          equal($('.image-annotator-drawn-pointers').length, 1, Drupal.t('There should only be one pointer'));
          equal($('#field_annotate__und__0__1__pointer').length, 1, Drupal.t('There should be no two pointers with the same id'));
          //@todo: Check offsets
        }
      },
      movePointer: function ($, Drupal, window, document, undefined) {
        return function () {
          expect(2);
          var $pointer = $('#field_annotate__und__0__1__pointer');
          var $img = $('.field-name-field-annotate-image img').first();
          var imgwidth = $img.width();
          var imgheight = $img.height();
          var imgOffset = $img.offset();
          // Image needs to be within the screen or simulate drag is buggy.
          $('html, body').animate({scrollTop: imgOffset.top}, 0);

          var positionBefore = $pointer.position();
          var pointerdataBefore = JSON.parse('[' + $('#field_annotate__und__0__coordinates').val() + ']')[0]
          var savedPositionBefore = {
            x: Math.round(parseFloat(pointerdataBefore.x, 10) * imgwidth),
            y: Math.round(parseFloat(pointerdataBefore.y, 10) * imgheight)
          };
          drag($pointer, 50, 50);
          var positionAfter = $pointer.position();
          var pointerdataAfter = JSON.parse('[' + $('#field_annotate__und__0__coordinates').val() + ']')[0];
          var savedPositionAfter = {
            x: Math.round((parseFloat(pointerdataAfter.x, 10) - (50/imgwidth)) * imgwidth),
            y: Math.round((parseFloat(pointerdataAfter.y, 10) - (50/imgheight)) * imgheight)
          };
          // allow a margin of 10px due to rounding errors.
          var allowedMargin = 10;
          var actual = { left: positionAfter.left, top: positionAfter.top },
          expected = { left: positionBefore.left + 50, top: positionBefore.top + 50 };
          deepEqual(actual, expected, Drupal.t('Pointers should have the right position after dragging'));
          ok(Math.abs(savedPositionBefore.x - savedPositionAfter.x) < allowedMargin && Math.abs(savedPositionBefore.y - savedPositionAfter.y) < allowedMargin, Drupal.t('Saved positions should be within the allowed margins'));
        }
      }/*,
      resizePointer: function ($, Drupal, window, document, undefined) {
        return function () {

        }
      },
      removePointer: function ($, Drupal, window, document, undefined) {
        return function () {

        }
      }*/
    }
  }
})(jQuery, Drupal, this, this.document);

