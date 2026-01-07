<?php

add_action('wp_ajax_gladwell_chat', 'gladwell_chat');
add_action('wp_ajax_nopriv_gladwell_chat', 'gladwell_chat');

function gladwell_chat() {
    check_ajax_referer('gladwell_nonce', 'nonce');

    $message = sanitize_text_field($_POST['message']);
    $api_key = get_option('gladwell_groq_key');
    $system = get_option('gladwell_system_prompt');

    if (!$api_key || !$system) {
        wp_send_json_error('Gladwell not configured.');
    }

    $payload = [
        'model' => 'llama-3.1-8b-instant',
        'temperature' => 0.3,
        'messages' => [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $message]
        ]
    ];

    $res = wp_remote_post(
        'https://api.groq.com/openai/v1/chat/completions',
        [
            'headers' => [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type'  => 'application/json'
            ],
            'body' => json_encode($payload),
            'timeout' => 20
        ]
    );

    if (is_wp_error($res)) {
        wp_send_json_error('Groq request failed.');
    }

    $body = json_decode(wp_remote_retrieve_body($res), true);

    // Safe check for response structure
    if (isset($body['choices'][0]['message']['content'])) {
        $reply = $body['choices'][0]['message']['content'];
    } else {
        $reply = 'Gladwell could not generate a response.';
    }

    wp_send_json_success(['reply' => $reply]);
}
