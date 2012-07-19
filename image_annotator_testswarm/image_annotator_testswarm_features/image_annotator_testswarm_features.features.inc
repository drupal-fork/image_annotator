<?php
/**
 * @file
 * image_annotator_testswarm_features.features.inc
 */

/**
 * Implements hook_node_info().
 */
function image_annotator_testswarm_features_node_info() {
  $items = array(
    'image_annotator_testswarm' => array(
      'name' => t('Image Annotator Testswarm'),
      'base' => 'node_content',
      'description' => t('Content Type to run Image Annotator Testswarm tests.'),
      'has_title' => '1',
      'title_label' => t('Title'),
      'help' => '',
    ),
  );
  return $items;
}
