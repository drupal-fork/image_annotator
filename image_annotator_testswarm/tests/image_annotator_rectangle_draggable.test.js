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
          var imgwidth = $('.field-name-field-annotate-image img').first().width();
          var imgheight = $('field-name-field-annotate-image img').first().height();

          var offsetBefore = $pointer.offset();
          var pointerdataBefore = JSON.parse('[' + $('#field_annotate__und__0__coordinates').val() + ']').splice(0, 1);
          var positionBefore = {
            x: parseFloat(pointerdataBefore.x, 10) * imgwidth,
            y: parseFloat(pointerdataBefore.y, 10) * imgheight
          };
          drag($pointer, 50, 50);
          var offsetAfter = $pointer.offset();
          var pointerdataAfter = JSON.parse('[' + $('#field_annotate__und__0__coordinates').val() + ']').splice(0, 1);
          var positionAfter = {
            x: parseFloat(pointerdataAfter.x, 10) * imgwidth,
            y: parseFloat(pointerdataAfter.y, 10) * imgheight
          };
          var actual = { left: offsetAfter.left, top: offsetAfter.top },
          expected = { left: offsetBefore.left + 50, top: offsetBefore.top + 50 };
          deepEqual(actual, expected, Drupal.t('Pointers should have the right position after dragging'));
          deepEqual(positionBefore, positionAfter, Drupal.t('Saved positions should be correct'));
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

