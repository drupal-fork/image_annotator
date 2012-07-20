(function ($, Drupal, window, document, undefined) {
  var drag = function (pointer, dx, dy) {
    $(pointer).simulate("drag", {
      dx: dx || 0,
      dy: dy || 0
    });
  };
  var resize = function(pointer, dx, dy) {
    // speed = sync -> Drag syncrhonously.
    // speed = fast|slow -> Drag asyncrhonously - animated.

    //this mouseover is to work around a limitation in resizable
    //see https://github.com/jquery/jquery-ui/blob/master/tests/unit/resizable/resizable_core.js
    $(pointer).simulate("mouseover");

    return $(pointer).simulate("drag", {
      dx: dx||0, dy: dy||0, speed: 'sync'
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
          expect(3);
          $('.image-annotator-button').first().simulate('click');
          equal($('.image-annotator-drawn-pointers').length, 1, Drupal.t('There should only be one pointer'));
          equal($('#field_annotate__und__0__1__pointer').length, 1, Drupal.t('There should be no two pointers with the same id'));
          var pointerdata = JSON.parse('[' + $('#field_annotate__und__0__coordinates').val() + ']');
          equal(pointerdata.length, 1, Drupal.t('There should be data for one pointer in the hidden field'));
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
          var pointerdataBefore = JSON.parse('[' + $('#field_annotate__und__0__coordinates').val() + ']')[0];
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
          var actual = {left: positionAfter.left, top: positionAfter.top},
          expected = {left: positionBefore.left + 50, top: positionBefore.top + 50};
          deepEqual(actual, expected, Drupal.t('Pointers should have the right position after dragging'));
          ok(Math.abs(savedPositionBefore.x - savedPositionAfter.x) < allowedMargin && Math.abs(savedPositionBefore.y - savedPositionAfter.y) < allowedMargin, Drupal.t('Saved positions should be within the allowed margins'));
        }
      },
      resizePointer: function ($, Drupal, window, document, undefined) {
        return function () {
          expect(8);
          var $pointer = $('#field_annotate__und__0__1__pointer');
          var $img = $('.field-name-field-annotate-image img').first();
          var imgwidth = $img.width();
          var imgheight = $img.height();
          var imgOffset = $img.offset();
          // Image needs to be within the screen or simulate drag is buggy.
          $('html, body').animate({scrollTop: imgOffset.top}, 0);
          /**
           * Bigger width.
           */
          var $handle = $pointer.find('.ui-resizable-e');
          var sizeBefore = {
            width: $pointer.width(),
            height: $pointer.height()
          };
          var pointerdataBefore = JSON.parse('[' + $('#field_annotate__und__0__coordinates').val() + ']')[0];
          var savedSizeBefore = {
            width: Math.round(parseFloat(pointerdataBefore.width, 10) * imgwidth),
            height: Math.round(parseFloat(pointerdataBefore.height, 10) * imgheight)
          };
          var resizeAmount = 50;
          resize($handle, resizeAmount);
          var sizeAfter = {
            width: $pointer.width(),
            height: $pointer.height()
          };
          var pointerdataAfter = JSON.parse('[' + $('#field_annotate__und__0__coordinates').val() + ']')[0];
          var savedSizeAfter = {
            width: Math.round((parseFloat(pointerdataAfter.width, 10) - (resizeAmount/imgwidth)) * imgwidth),
            height: Math.round(parseFloat(pointerdataAfter.height, 10) * imgheight)
          };
          // allow a margin of 10px due to rounding errors.
          var allowedMargin = 10;
          var actual = {width: sizeAfter.width, height: sizeAfter.height},
          expected = {width: sizeBefore.width + resizeAmount, height: sizeBefore.height};
          deepEqual(actual, expected, Drupal.t('Bigger Width: Pointers should have the right dimesions after resizing'));
          ok(Math.abs(savedSizeBefore.width - savedSizeAfter.width) < allowedMargin && Math.abs(savedSizeBefore.height - savedSizeAfter.height) < allowedMargin, Drupal.t('Bigger Width: Saved dimensions should be within the allowed margins'));
          /**
           * Bigger height.
           */
          $handle = $pointer.find('.ui-resizable-s');
          sizeBefore = {
            width: $pointer.width(),
            height: $pointer.height()
          };
          pointerdataBefore = JSON.parse('[' + $('#field_annotate__und__0__coordinates').val() + ']')[0];
          savedSizeBefore = {
            width: Math.round(parseFloat(pointerdataBefore.width, 10) * imgwidth),
            height: Math.round(parseFloat(pointerdataBefore.height, 10) * imgheight)
          };
          resize($handle, 0, resizeAmount);
          sizeAfter = {
            width: $pointer.width(),
            height: $pointer.height()
          };
          pointerdataAfter = JSON.parse('[' + $('#field_annotate__und__0__coordinates').val() + ']')[0];
          savedSizeAfter = {
            width: Math.round(parseFloat(pointerdataAfter.width, 10) * imgwidth),
            height: Math.round((parseFloat(pointerdataAfter.height, 10) - (resizeAmount/imgheight)) * imgheight)
          };
          actual = {width: sizeAfter.width, height: sizeAfter.height};
          expected = {width: sizeBefore.width, height: sizeBefore.height + resizeAmount};
          deepEqual(actual, expected, Drupal.t('Bigger Height: Pointers should have the right dimesions after resizing'));
          ok(Math.abs(savedSizeBefore.width - savedSizeAfter.width) < allowedMargin && Math.abs(savedSizeBefore.height - savedSizeAfter.height) < allowedMargin, Drupal.t('Bigger Height: Saved dimensions should be within the allowed margins'));
          /**
           * Smaller width.
           */
          $handle = $pointer.find('.ui-resizable-e');
          sizeBefore = {
            width: $pointer.width(),
            height: $pointer.height()
          };
          pointerdataBefore = JSON.parse('[' + $('#field_annotate__und__0__coordinates').val() + ']')[0];
          savedSizeBefore = {
            width: Math.round(parseFloat(pointerdataBefore.width, 10) * imgwidth),
            height: Math.round(parseFloat(pointerdataBefore.height, 10) * imgheight)
          };
          resizeAmount = -20
          resize($handle, resizeAmount);
          sizeAfter = {
            width: $pointer.width(),
            height: $pointer.height()
          };
          pointerdataAfter = JSON.parse('[' + $('#field_annotate__und__0__coordinates').val() + ']')[0];
          savedSizeAfter = {
            width: Math.round((parseFloat(pointerdataAfter.width, 10) - (resizeAmount/imgwidth)) * imgwidth),
            height: Math.round(parseFloat(pointerdataAfter.height, 10) * imgheight)
          };
          actual = {width: sizeAfter.width, height: sizeAfter.height};
          expected = {width: sizeBefore.width + resizeAmount, height: sizeBefore.height};
          deepEqual(actual, expected, Drupal.t('Smaller Width: Pointers should have the right dimesions after resizing'));
          ok(Math.abs(savedSizeBefore.width - savedSizeAfter.width) < allowedMargin && Math.abs(savedSizeBefore.height - savedSizeAfter.height) < allowedMargin, Drupal.t('Smaller Width: Saved dimensions should be within the allowed margins'));
          /**
           * Smaller height.
           */
          $handle = $pointer.find('.ui-resizable-s');
          sizeBefore = {
            width: $pointer.width(),
            height: $pointer.height()
          };
          pointerdataBefore = JSON.parse('[' + $('#field_annotate__und__0__coordinates').val() + ']')[0];
          savedSizeBefore = {
            width: Math.round(parseFloat(pointerdataBefore.width, 10) * imgwidth),
            height: Math.round(parseFloat(pointerdataBefore.height, 10) * imgheight)
          };
          resize($handle, 0, resizeAmount);
          sizeAfter = {
            width: $pointer.width(),
            height: $pointer.height()
          };
          pointerdataAfter = JSON.parse('[' + $('#field_annotate__und__0__coordinates').val() + ']')[0];
          savedSizeAfter = {
            width: Math.round(parseFloat(pointerdataAfter.width, 10) * imgwidth),
            height: Math.round((parseFloat(pointerdataAfter.height, 10) - (resizeAmount/imgheight)) * imgheight)
          };
          actual = {width: sizeAfter.width, height: sizeAfter.height};
          expected = {width: sizeBefore.width, height: sizeBefore.height + resizeAmount};
          deepEqual(actual, expected, Drupal.t('Smaller Height: Pointers should have the right dimesions after resizing'));
          ok(Math.abs(savedSizeBefore.width - savedSizeAfter.width) < allowedMargin && Math.abs(savedSizeBefore.height - savedSizeAfter.height) < allowedMargin, Drupal.t('Smaller Height: Saved dimensions should be within the allowed margins'));

        }
      },
      removePointer: function ($, Drupal, window, document, undefined) {
        return function () {
          expect(6);
          //add an other pointer.
          $('.image-annotator-button').first().simulate('click');
          equal($('.image-annotator-drawn-pointers').length, 2, Drupal.t('There should be 2 pointers'));
          var $pointer = $('#field_annotate__und__0__1__pointer');
          var $removeLink = $('#field_annotate__und__0__coordinates').parent().find('.image-annotator-pointer-label').find('a[rel="field_annotate_und_0_1"].image-annotator-remove');
          equal($pointer.length, 1, Drupal.t('Pointer present before clicking on Remove'));
          var pointerdataBefore = JSON.parse('[' + $('#field_annotate__und__0__coordinates').val() + ']');
          equal(pointerdataBefore.length, 2, Drupal.t('There should be data for two pointers in the hidden field'));
          $removeLink.simulate("click");
          equal($('#field_annotate__und__0__1__pointer').length, 0, Drupal.t('Pointer not present after clicking on Remove'));
          var pointerdataAfter = JSON.parse('[' + $('#field_annotate__und__0__coordinates').val() + ']');
          equal(pointerdataAfter.length, 1, Drupal.t('There should be data for one pointer in the hidden field'));
          var pointers = $.grep(pointerdataAfter, function (check_pointer, i) {
            return (
              pointerdataAfter.id == 1
              && pointerdataAfter.field.fieldname == 'field_annotate'
              && pointerdataAfter.field.lang == 'und'
              && pointerdataAfter.field.delta == '0'
            );
          });
          equal(pointers.length, 0, Drupal.t('The data of the right pointer should be removed'));
        }
      }
    }
  }
})(jQuery, Drupal, this, this.document);

