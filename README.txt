INSTALLATION
------------

Install as usual, see http://drupal.org/documentation/install/modules-themes/modules-7 for further information.

REQUIREMENTS
------------

* JSON2 (http://drupal.org/project/json2)

RECOMMENDED
-----------

* Fixed Field (http://drupal.org/project/fixed_field)
* Field Collection (http://drupal.org/project/field_collection)

WIDGETS
-------
* Pointer:
  This will add a number on the image when you click on the image. The
  number can not be moved to a different spot, but it can be removed.
* Rectangle:
  This will draw a rectangle over the image when you click and drag over
  the image. Rectangles can not be resized or moved once they are drawn,
  but they can be removed.
* Draggable Pointer:
  Pointer that can be moved after it has been drawn.
* Draggable & Resizable Rectangle:
  Rectangle that can be moved and resized after it has been drawn.

EXAMPLE SETUP
-------------
  Annotations without additional text or info
  ********************************************
  If you follow these steps you will create a simple image field that can be
  annotated (without adding additional text to the annotations). This can be
  useful if you want users to do something like "Point out the 7 differences".

  1. Create a content type (or any other entity bundle).
  2. Add an image field or a fixed field (Note: if you want to annotate the same
     image each time you create an entity of this bundle, use fixed_field, if
     you want the user to choose which image to annotate, use an image field).
     Make sure you remember the machine name of this field
    (e.g. field_image_annotator).
  3. Add an "Image Annotator" field and choose your widget.
  4. On the settings page, select the image field you created in step 2.
  5. Go to the page to create or edit your content as you normally would.
  6. Click on the 'Place on image' button and then on the image to add an
     annotation.

  Annotations with additional text or info
  ********************************************
  If you follow these steps you will create an image field that can be annotated
  with additional text for the annotations. This can be useful if you want users
  to do something like "Point out the cat and the dog".

  1. Create a content type (or any other entity bundle).
  2. Add an image field or a fixed field (Note: if you want to annotate the same
     image each time you create an entity of this bundle, use fixed_field, if
     you want the user to choose which image to annotate, use an image field).
     Make sure you remember the machine name of this field
    (e.g. field_image_annotator).
  3. Add a field_collection field to the bundle.
  4. Go to the field_collection and add a textfield (or any other field you want
     to relate to an annotation) to it.
  5. Add an "Image Annotator" field and choose your widget.
  6. On the settings page, select the image field you created in step 2.
  7. Go to the page to create or edit your content as you normally would.
  8. Click on the 'Place on image' button and then on the image to add an
     annotation. You'll see the annotation appear in the field_collection_item.
