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

          if ($('#' + Drupal.imageAnnotators[coordfield].imagefield + ' .image-preview img').length) {
            Drupal.imageAnnotators[coordfield].toggleButton($('.image-annotator-button'), true);
          }
          else {
            Drupal.imageAnnotators[coordfield].toggleButton($('.image-annotator-button'), false);
          }

          Drupal.imageAnnotators[coordfield].bindButtons(context);
          Drupal.imageAnnotators[coordfield].bindImages(context);
          Drupal.imageAnnotators[coordfield].readPointers(context);
          Drupal.imageAnnotators[coordfield].drawPointers();
        });

      }
    }
  };

  Drupal.imageAnnotator = function (settings) {
    this.placing = false;
    this.placingElement = false;
    this.targetImage = false;
    this.pointers = {};
    this.numberOfPointers = 0;
    this.imagefield = settings.rel;
    this.edit = settings.edit;
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
          if (typeof target === 'undefined') {
            target = $('.' + image + '.field-type-image img').get(0);
          }
          var number = self.numberOfPointers + 1;
          var $pointer = $('<span><span>' + number + '</span></span>');
          var $pointer_label = $pointer.clone();
          $pointer.addClass('image-annotator-pointer');
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
            targetImage: $(target),
            pointer_label: $pointer_label
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
    $(context).find('.image-annotator-button').click(function(event) {
      var element = $(this).attr('id').split('__');
      self.placing = true;
      self.placingElement = {
        fieldname: element[0],
        lang: element[1],
        delta: element[2]
      };
      var $imageTarget = $('#' + $(this).attr('rel') + ' .image-preview img');
      $imageTarget.addClass('image-annotator-current-target');
      self.targetImage = $imageTarget;
      self.toggleButton($(this), false);
      event.preventDefault();
    });
  }

  Drupal.imageAnnotator.prototype.bindImages = function(context) {
    var self = this;
    $('html').click(function (event){
      if (self.placing) {
        self.addPointer(event);
      }
    });
  }

  Drupal.imageAnnotator.prototype.addPointer = function (event) {
    var self = this;
    var $target = $(event.target);
    if ($target.hasClass('image-annotator-current-target')) {
      var number = ++self.numberOfPointers;
      var $pointer = $('<span><span>' + number + '</span></span>')
      var $pointer_label = $pointer.clone();
      var x = (event.layerX);
      var y = (event.layerY);
      var relativex = x - event.target.offsetLeft;
      var relativey = y - event.target.offsetTop;

      $pointer.addClass('image-annotator-pointer');
      $pointer_label.addClass('image-annotator-pointer-label');
      if (self.edit) {
        $pointer_label.append('(<a href="#" rel="' + self.placingElement.fieldname + '_' + x + '_' + y + '" class="image-annotator-remove" >' + Drupal.t('Remove') + '</a>)');
        self.bindRemove($pointer_label);
      }
      var pointer = {
        pointer: $pointer,
        x: x,
        y: y,
        field: self.placingElement,
        number: number,
        targetImage: $target,
        pointer_label: $pointer_label
      };

      self.pointers[pointer.field.fieldname + '_' + pointer.x + '_' + pointer.y] = pointer;
      self.drawPointer(pointer);
      

      var id = '#' + self.placingElement.fieldname + '__' + self.placingElement.lang + '__' + self.placingElement.delta
      var curval = $(id + '__coordinates').val();
      if (curval.length) {
        curval += ',';
      }
      // store the coordinates relative to the image

      curval += JSON.stringify(
        {
          x:relativex,
          y:relativey,
          field: self.placingElement.fieldname,
          delta: self.placingElement.delta,
          language: self.placingElement.lang
        }
      );
      $(id + '__coordinates').val(curval);
      self.toggleButton($(id + '__button'), true);
    }
    if (!$target.hasClass('image-annotator-button')) {
      self.placing = false;
      $('.image-annotator-current-target').removeClass('image-annotator-current-target');
    }
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
    $pointer.insertAfter(pointer.targetImage);
    $pointer.css(
      {
        left: pointer.x - ($pointer.width()/2),
        top: pointer.y - ($pointer.height()/2),
        position: 'absolute'
      }
    );
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
