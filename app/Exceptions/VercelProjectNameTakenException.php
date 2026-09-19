<?php

namespace App\Exceptions;

class VercelProjectNameTakenException extends VercelException
{
    /**
     * @param  array<string, mixed>  $responseBody
     */
    public function __construct(
        public readonly string $projectName,
        string $message = '',
        int $statusCode = 409,
        array $responseBody = [],
        ?\Throwable $previous = null
    ) {
        $msg = $message !== '' ? $message : "The project or subdomain '{$projectName}.vercel.app' is already claimed on Vercel. Please choose a different subdomain.";
        parent::__construct($msg, $statusCode, $responseBody, $previous);
    }
}
