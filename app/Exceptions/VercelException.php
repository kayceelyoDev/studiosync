<?php

namespace App\Exceptions;

use Exception;

class VercelException extends Exception
{
    /**
     * @param  array<string, mixed>  $responseBody
     */
    public function __construct(
        string $message,
        public readonly int $statusCode = 0,
        public readonly array $responseBody = [],
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $statusCode, $previous);
    }
}
