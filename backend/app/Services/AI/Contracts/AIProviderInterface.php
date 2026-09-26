<?php

namespace App\Services\AI\Contracts;

interface AIProviderInterface
{
    /**
     * Generate a response based on the message and context.
     *
     * @param string $message
     * @param array $context
     * @return array|string
     */
    public function generateResponse(string $message, array $context = []): array|string;
}
