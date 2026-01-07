<?php
/**
 * Plugin Name: Gladwell AI
 * Description: Groq-powered AI backend for WordPress sites.
 * Version: 0.1.0
 * Author: Fred Juma
 */

if (!defined('ABSPATH')) exit;

// Include admin settings
require_once plugin_dir_path(__FILE__) . 'admin/settings.php';

// Include API
require_once plugin_dir_path(__FILE__) . 'api/chat.php';

// Enqueue scripts and styles
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('gladwell-css', plugin_dir_url(__FILE__) . 'public/embed.css');
    wp_enqueue_script('gladwell-js', plugin_dir_url(__FILE__) . 'public/embed.js', [], null, true);

    wp_localize_script('gladwell-js', 'Gladwell', [
        'ajax' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('gladwell_nonce')
    ]);
});

// Shortcode
add_shortcode('gladwell', function () {
    return '<div id="gladwell-root"></div>';
});
