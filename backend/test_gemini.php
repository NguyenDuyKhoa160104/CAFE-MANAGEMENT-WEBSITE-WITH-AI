<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$apiKey = env('GEMINI_API_KEY');
$model = env('GEMINI_MODEL', 'gemini-3.8-flash');
$baseUrl = env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta');

echo "Using API Key: " . substr($apiKey, 0, 5) . "...\n";
echo "Model: $model\n";
echo "Base URL: $baseUrl\n";

$url = "{$baseUrl}/models/{$model}:generateContent?key={$apiKey}";

$payload = [
    'contents' => [
        [
            'role' => 'user',
            'parts' => [
                ['text' => 'Hello']
            ]
        ]
    ]
];

$response = Http::post($url, $payload);
echo "Status: " . $response->status() . "\n";
echo "Body:\n" . $response->body() . "\n";
