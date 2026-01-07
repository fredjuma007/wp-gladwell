<?php

// Add menu
add_action('admin_menu', function() {
    add_menu_page(
        'Gladwell AI Settings',
        'Gladwell AI',
        'manage_options',
        'gladwell-ai',
        function() {
            ?>
            <div class="wrap">
                <h1>Gladwell AI Settings</h1>
                <form method="post" action="options.php">
                    <?php
                    settings_fields('gladwell');
                    do_settings_sections('gladwell');
                    submit_button();
                    ?>
                </form>
            </div>
            <?php
        },
        'dashicons-format-chat',
        100
    );
});

// Register settings
add_action('admin_init', function() {
    register_setting('gladwell', 'gladwell_groq_key');
    register_setting('gladwell', 'gladwell_system_prompt');

    add_settings_section('gladwell_main', 'AI Configuration', null, 'gladwell');

    add_settings_field(
        'gladwell_groq_key',
        'Groq API Key',
        function() {
            echo '<input type="password" name="gladwell_groq_key" class="regular-text" value="' . esc_attr(get_option('gladwell_groq_key')) . '">';
        },
        'gladwell',
        'gladwell_main'
    );

    add_settings_field(
        'gladwell_system_prompt',
        'System Prompt',
        function() {
            echo '<textarea name="gladwell_system_prompt" rows="8" class="large-text">' . esc_textarea(get_option('gladwell_system_prompt')) . '</textarea>';
        },
        'gladwell',
        'gladwell_main'
    );
});
