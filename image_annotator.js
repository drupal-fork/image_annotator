(function ($){
  Drupal.behaviors.imageAnnotator = {
    attach: function (context) {
      if ($(context).is('form') || typeof Drupal.imageAnnotators === 'undefined') {
        if (typeof Drupal.imageAnnotators === 'undefined') {
          Drupal.imageAnnotators = {};
        }
        else {
          $(context).find('.image-annotator-pointer').remove();
          $(context).find('image-annotator-pointer-label').remove();
        }
        $.each(Drupal.settings.imageAnnotator, function (coordfield, settings) {
          Drupal.imageAnnotators[coordfield] = new Drupal.imageAnnotator(settings);
          Drupal.imageAnnotators[coordfield].bindButtons(context);
          Drupal.imageAnnotators[coordfield].bindImages(context);
          Drupal.imageAnnotators[coordfield].readPointers(context);
          Drupal.imageAnnotators[coordfield].drawPointers();
        });

      }
    }
  };

  Drupal.imageAnnotator = function (settings) {
    var self = this;
    self.placing = false;
    self.placingElement = false;
    self.targetImage = false;
    self.pointers = {};
    self.numberOfPointers = 0;
    self.imagefield = settings.imagefield;
    self.edit = settings.edit;
    self.drawingRectangle = false;
    self.rectangleTarget = undefined;
    self.rectangleX = undefined;
    self.rectangleY = undefined;
    self.rectangleWidth = 20;
    self.rectangleHeight = 20;
    if ($('#' + self.imagefield + ' img').length) {
      self.toggleButton($('.image-annotator-button'), true);
    }
    else {
      self.toggleButton($('.image-annotator-button'), false);
    }
    var $imageField = $('#' + self.imagefield + ' img');
    if (!$imageField.length) {
      $imageField = $('.' + self.imagefield + '.field-type-image img');
    }
    if (!$imageField.length) {
      $imageField = $('#' + self.imagefield + ' img');
    }
    if (!$imageField.length) {
      $imageField = $('.' + self.imagefield + ' img');
    }
    $imageField.first().parent().css({position: 'relative'});
  }

  // Helper function to toggle buttons
  Drupal.imageAnnotator.prototype.toggleButton = function(button, enable) {
    if (!enable) {
      button.attr('disabled', 'disabled').addClass('form-button-disabled');
    }
    else {
      button.removeAttr('disabled').removeClass('form-button-disabled');
    }
  }

  Drupal.imageAnnotator.prototype.readPointers = function(context) {
    var self = this;
    $(context).find('.image-annotator-pointers').each(function() {
      var pointer_data = JSON.parse('[' + $(this).val() + ']');
      $.each(pointer_data, function (index, data){
        var image = $('#' + data.field + '__' + data.language + '__' + data.delta + '__button' ).attr('rel');
        if (image) {
          var target = $('#' + image + ' .image-preview img').get(0);
          var $targetImage = $('#' + image + ' .image-preview .image-annotator-target').first();
          if (typeof target === 'undefined') {
            target = $('.' + image + '.field-type-image img').get(0);
            $targetImage = $('.' + image + '.field-type-image .image-annotator-target').first();
          }
          if (typeof target === 'undefined') {
            target = $('#' + image + ' img').get(0);
            $targetImage = $('#' + image + ' .image-annotator-target').first();
          }
          if (typeof target === 'undefined') {
            target = $('.' + image + ' img').get(0);
            $targetImage = $('#' + image + ' .image-annotator-target').first();
          }
          var number = self.numberOfPointers + 1;
          var $pointer = $('<span><span>' + number + '</span></span>');
          var $pointer_label = $pointer.clone();
          var type = (typeof data.type == 'undefined') ? 'pointer' : data.type;
          $pointer.addClass('image-annotator-' + type);
          $pointer_label.addClass('image-annotator-pointer-label');
          var x = parseInt(data.x, 10) + target.offsetLeft;
          var y = parseInt(data.y, 10) + target.offsetTop;
          if (self.edit) {
            $pointer_label.append('(<a href="#" rel="' + data.field + '_' + x + '_' + y + '" class="image-annotator-remove" >' + Drupal.t('Remove') + '</a>)');
            self.bindRemove($pointer_label);
          }
          var pointer = {
            pointer: $pointer,
            x: x,
            y: y,
            field: {
              fieldname: data.field,
              lang: data.language,
              delta: data.delta
            },
            number: number,
            targetImage: $targetImage,
            pointer_label: $pointer_label,
            width: (typeof data.width == 'undefined') ? 20 : data.width,
            height: (typeof data.height == 'undefined') ? 20 : data.height,
            type: type
          };
          if (typeof self.pointers[pointer.field.fieldname + '_' + x + '_' + y] === 'undefined') {
            self.pointers[pointer.field.fieldname + '_' + x + '_' + y] = pointer;
            self.numberOfPointers++;
          }

        }
      });
    });
  }

  Drupal.imageAnnotator.prototype.bindButtons = function(context) {
    var self = this;
    $(context).find('.image-annotator-button').each(function () {
      if (!$('#' + $(this).attr('rel') + '-target').length) {
        var image = $(this).attr('rel');
        var $imageTarget = $('#' + image + ' img').first();
        if (!$imageTarget.length) {
          $imageTarget = $('.' + image + '.field-type-image img').first();
        }
        if (!$imageTarget.length) {
          $imageTarget = $('#' + image + ' img').first();
        }
        if (!$imageTarget.length) {
          $imageTarget = $('.' + image + ' img').first();
        }
        
        var $targetdiv = $('<div id="' + $(this).attr('rel') + '-target"></div>');
        $targetdiv.css({
          width: $imageTarget.width(),
          height: $imageTarget.height(),
          position: 'absolute',
          top: 0,
          left: 0
        });
        $targetdiv.addClass('image-annotator-target');
        $imageTarget.after($targetdiv);
      }
    })
    $(context).find('.image-annotator-button').click(function(event) {
      var $button = $(this);
      var element = $button.attr('id').split('__');
      var type;
      if ($button.hasClass('image-annotator-pointer')) {
        type = 'pointer';
      }
      else if ($button.hasClass('image-annotator-rectangle')) {
        type = 'rectangle';
      }
      self.placing = true;
      self.placingElement = {
        fieldname: element[0],
        lang: element[1],
        delta: element[2],
        type: type
      };
      var $imageTarget = $('#' + $(this).attr('rel') + '-target').first();
      $imageTarget.addClass('image-annotator-current-target');
      self.targetImage = $imageTarget;
      self.toggleButton($button, false);
      event.preventDefault();
    });
  }

  Drupal.imageAnnotator.prototype.bindImages = function(context) {
    var self = this;
    $('html').click(function (event){
      if (self.placing && (typeof self.placingElement.type == 'undefined' || self.placingElement.type == 'pointer')) {
        self.addPointer(event);
      }
    });
    $('html').mousedown(function (event) {
      if (self.placing && typeof self.placingElement.type != 'undefined' && self.placingElement.type == 'rectangle' && $(event.target).hasClass('image-annotator-current-target')) {
        if (!self.drawingRectangle) {
          self.rectangleTarget = event.target;
          self.rectangleX = event.layerX;
          self.rectangleY = event.layerY;
          self.rectangleWidth = 20;
          self.rectangleHeight = 20;
          self.drawingRectangle = true;
          var pointer = self.addPointer(event);
          var $pointer = pointer.pointer;
          //event.preventDefault();
          var $target = $(event.target);
          $target.mousemove(function (event){
            if (self.drawingRectangle) {
              var x = event.pageX - $target.offset().left;
              var y = event.pageY - $target.offset().top;

              if (x < self.rectangleX) {
                self.rectangleX = x;
                pointer.x = x;
              }
              if (y < self.rectangleY) {
                self.rectangleY = y;
                pointer.y = y;
              }
              self.rectangleWidth = Math.max(20, Math.abs(x - self.rectangleX));
              self.rectangleHeight = Math.max(20, Math.abs(y - self.rectangleY));
              pointer.width = self.rectangleWidth;
              pointer.height = self.rectangleHeight;
              $pointer.css({
                width: pointer.width + 'px',
                height: pointer.height + 'px',
                top: pointer.y,
                left: pointer.x
              })
              
              //event.preventDefault();
            }
          });
          $target.mouseup(function (event) {
            if (self.drawingRectangle) {
              self.drawingRectangle = false;
              delete self.rectangleTarget;
              self.savePointer(pointer);
              $(event.target).unbind('mousemove');
            }
          });
        }
      }
    });
  }

  Drupal.imageAnnotator.prototype.addPointer = function (event) {
    var self = this;
    var $target = $(event.target);
    var id = '#' + self.placingElement.fieldname + '__' + self.placingElement.lang + '__' + self.placingElement.delta;
    var pointer;
    if ($target.hasClass('image-annotator-current-target')) {
      var type = (typeof self.placingElement.type == 'undefined') ? 'pointer' : self.placingElement.type;
      var number = ++self.numberOfPointers;
      var $pointer = $('<span><span>' + number + '</span></span>');
      var $pointer_label = $pointer.clone();
      var x = event.target.offsetLeft;
      var y = event.target.offsetTop;
      var width = 0;
      var height = 0;
      if (type == 'pointer') {
        x = (event.layerX);
        y = (event.layerY);
      }
      else if (type == 'rectangle'){
        x = self.rectangleX;
        y = self.rectangleY;
        width = self.rectangleWidth;
        height = self.rectangleHeight;
      }
      var relativex = x - event.target.offsetLeft;
      var relativey = y - event.target.offsetTop;

      $pointer.addClass('image-annotator-' + type);
      $pointer_label.addClass('image-annotator-pointer-label');
      if (self.edit) {
        $pointer_label.append('(<a href="#" rel="' + self.placingElement.fieldname + '_' + x + '_' + y + '" class="image-annotator-remove" >' + Drupal.t('Remove') + '</a>)');
        self.bindRemove($pointer_label);
      }
      pointer = {
        pointer: $pointer,
        x: relativex,
        y: relativey,
        field: self.placingElement,
        number: number,
        targetImage: $target,
        pointer_label: $pointer_label,
        width: width,
        height: height,
        type: type
      };

      self.pointers[pointer.field.fieldname + '_' + pointer.x + '_' + pointer.y] = pointer;
      self.drawPointer(pointer);
      if (pointer.type == 'pointer') {
        self.savePointer(pointer);
      }
    }
    else {
      self.toggleButton($(id + '__button'), true);
    }
    if (!$target.hasClass('image-annotator-button')) {
      self.placing = false;
      $('.image-annotator-current-target').removeClass('image-annotator-current-target');
    }
    return pointer;
  }

  Drupal.imageAnnotator.prototype.savePointer = function (pointer) {
    var self = this;
    var id = '#' + pointer.field.fieldname + '__' + pointer.field.lang + '__' + pointer.field.delta
    var curval = $(id + '__coordinates').val();
      if (curval.length) {
        curval += ',';
      }
      // store the coordinates relative to the image

      curval += JSON.stringify(
        {
          x:pointer.x,
          y:pointer.y,
          field: pointer.field.fieldname,
          delta: pointer.field.delta,
          language: pointer.field.lang,
          type: pointer.type,
          width: pointer.width,
          height: pointer.height
        }
      );
      $(id + '__coordinates').val(curval);
      self.toggleButton($(id + '__button'), true);
  }

  Drupal.imageAnnotator.prototype.removePointer = function (pointer) {
    var self = this;
    pointer.pointer.remove();
    pointer.pointer_label.remove();
    var id = '#' + pointer.field.fieldname + '__' + pointer.field.lang + '__' + pointer.field.delta
    var curval = $(id + '__coordinates').val();
    var pointers = JSON.parse('[' + curval + ']');
    var target = pointer.targetImage.get(0);
    pointers = $.grep(pointers, function (check_pointer, i) {
      var x = parseInt(check_pointer.x, 10) + target.offsetLeft;
      var y = parseInt(check_pointer.y, 10) + target.offsetTop;
      return !(
        pointer.x == x
        && pointer.y == y
        && pointer.field.fieldname == check_pointer.field
        && pointer.field.lang == check_pointer.language
        && pointer.field.delta == check_pointer.delta
      );
    });
    curval = '';
    if (pointers.length) {
      $.each(pointers, function(index, value) {
        if (curval.length) {
          curval += ',';
        }
        curval += JSON.stringify(value)
      });
    }
    $(id + '__coordinates').val(curval);
    delete self.pointers[pointer.field.fieldname + '_' + pointer.x + '_' + pointer.y];

  }

  Drupal.imageAnnotator.prototype.drawPointer = function(pointer) {
    var $pointer = pointer.pointer;
    var $pointer_label = pointer.pointer_label;
    var id = '#' + pointer.field.fieldname + '__' + pointer.field.lang + '__' + pointer.field.delta;
    var css = {
      left: pointer.x - ($pointer.width()/2),
      top: pointer.y - ($pointer.height()/2),
      position: 'absolute'
    };
    if (pointer.type == 'rectangle') {
      var additional_css = {
        display: 'block',
        width: pointer.width + 'px',
        height: pointer.height + 'px'
      }
      $.extend(css, additional_css);
    }
    //$pointer.insertAfter(pointer.targetImage);
    pointer.targetImage.append($pointer);
    $pointer.css(css);
    $pointer_label.insertAfter(id + '__button');
  }

  Drupal.imageAnnotator.prototype.drawPointers = function() {
    var self = this;
    $.each(self.pointers, function (index, pointer) {
      self.drawPointer(pointer);
    });
  }

  Drupal.imageAnnotator.prototype.bindRemove = function ($pointer_label) {
    var self = this;
    if (self.edit) {
      $pointer_label.find('a.image-annotator-remove').click(function (event) {
        //self.removePointer(self.pointers[$(this).attr('rel')]));
        var key = $(this).attr('rel')
        if (typeof self.pointers[key] !== 'undefined') {
          self.removePointer(self.pointers[key]);
        }
        event.preventDefault();
      });
    }
  }
})(jQuery);
