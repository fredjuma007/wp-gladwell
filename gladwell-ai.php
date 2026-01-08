<?php
/**
 * Plugin Name: Gladwell AI
 * Description: Groq-powered AI assistant
 * Version: 1.0.0
 * Author: Fred Juma
 */

if (!defined('ABSPATH')) exit;

/* ---------------- ADMIN MENU ---------------- */

add_action('admin_menu', function () {
    add_menu_page(
        'Gladwell AI',
        'Gladwell AI',
        'manage_options',
        'gladwell-ai',
        'gladwell_settings_page',
        'dashicons-format-chat',
        100
    );
});

function gladwell_settings_page() {
    ?>
    <div class="wrap">
        <h1>Gladwell AI Settings</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('gladwell_settings');
            do_settings_sections('gladwell-ai');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

/* ---------------- SETTINGS ---------------- */

add_action('admin_init', function () {
    register_setting('gladwell_settings', 'gladwell_groq_key', [
        'sanitize_callback' => 'trim'
    ]);
    register_setting('gladwell_settings', 'gladwell_system_prompt');

    add_settings_section(
        'gladwell_section',
        'AI Configuration',
        null,
        'gladwell-ai'
    );

    add_settings_field(
        'gladwell_groq_key',
        'Groq API Key',
        function () {
            echo '<input type="text" class="regular-text" style="width: 100%; max-width: 600px;" name="gladwell_groq_key" value="' . esc_attr(get_option('gladwell_groq_key')) . '" autocomplete="off">';
        },
        'gladwell-ai',
        'gladwell_section'
    );

    add_settings_field(
        'gladwell_system_prompt',
        'System Prompt',
        function () {
            echo '<textarea class="large-text" rows="6" name="gladwell_system_prompt">' . esc_textarea(get_option('gladwell_system_prompt')) . '</textarea>';
        },
        'gladwell-ai',
        'gladwell_section'
    );
});

/* ---------------- FRONTEND ---------------- */

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style(
        'gladwell-css',
        plugin_dir_url(__FILE__) . 'public/embed.css',
        [],
        time()
    );

    wp_enqueue_script(
        'gladwell-js',
        plugin_dir_url(__FILE__) . 'public/embed.js',
        [],
        time(),
        true
    );

    wp_localize_script('gladwell-js', 'Gladwell', [
        'ajax'  => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('gladwell_nonce')
    ]);
});

add_shortcode('gladwell', function () {
    return '<div id="gladwell-root"></div>';
});

/* ---------------- AJAX CHAT ---------------- */

add_action('wp_ajax_gladwell_chat', 'gladwell_chat');
add_action('wp_ajax_nopriv_gladwell_chat', 'gladwell_chat');

function gladwell_chat() {
    check_ajax_referer('gladwell_nonce', 'nonce');

    $message = sanitize_text_field($_POST['message'] ?? '');
    $api_key = get_option('gladwell_groq_key');
    $system  = get_option('gladwell_system_prompt');

    if (!$api_key || !$system) {
        wp_send_json_error('Gladwell not configured.');
    }

    $payload = [
        'model' => 'llama-3.1-8b-instant',
        'messages' => [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $message]
        ],
        'temperature' => 0.3
    ];

    $response = wp_remote_post(
        'https://api.groq.com/openai/v1/chat/completions',
        [
            'headers' => [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type'  => 'application/json'
            ],
            'body'    => json_encode($payload),
            'timeout' => 20
        ]
    );

    if (is_wp_error($response)) {
        wp_send_json_error($response->get_error_message());
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);

    if (!isset($body['choices'][0]['message']['content'])) {
        $error = $body['error']['message'] ?? 'Unknown API error';
        wp_send_json_error($error);
    }

    wp_send_json_success(['reply' => $body['choices'][0]['message']['content']]);
}
