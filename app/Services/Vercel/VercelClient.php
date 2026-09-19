<?php

namespace App\Services\Vercel;

use App\Exceptions\VercelException;
use App\Exceptions\VercelProjectNameTakenException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VercelClient
{
    private string $token;

    private ?string $teamId;

    private string $baseUrl;

    private string $webhookSecret;

    public function __construct(
        ?string $token = null,
        ?string $teamId = null,
        ?string $baseUrl = null,
        ?string $webhookSecret = null,
    ) {
        $this->token = (string) ($token ?? config('services.vercel.token', ''));
        $this->teamId = $teamId ?? config('services.vercel.team_id');
        $this->baseUrl = rtrim((string) ($baseUrl ?? config('services.vercel.base_url', 'https://api.vercel.com')), '/');
        $this->webhookSecret = (string) ($webhookSecret ?? config('services.vercel.webhook_secret', ''));
    }

    /**
     * Build standard pending HTTP request with auth and headers.
     */
    protected function http(): PendingRequest
    {
        return Http::withToken($this->token)
            ->acceptJson()
            ->timeout(20);
    }

    /**
     * Build endpoint URL, automatically appending teamId query parameter if present.
     *
     * @param  array<string, mixed>  $queryParams
     */
    public function buildUrl(string $path, array $queryParams = []): string
    {
        $path = '/'.ltrim($path, '/');

        if (! empty($this->teamId)) {
            $queryParams['teamId'] = $this->teamId;
        }

        $query = http_build_query($queryParams);

        return $this->baseUrl.$path.($query !== '' ? '?'.$query : '');
    }

    /**
     * Check if a Vercel project exists.
     *
     * @return array<string, mixed>|null
     */
    public function getProject(string $projectNameOrId): ?array
    {
        $url = $this->buildUrl("/v9/projects/{$projectNameOrId}");
        $response = $this->http()->get($url);

        if ($response->status() === 404) {
            return null;
        }

        if ($response->failed()) {
            $this->handleErrorResponse($response, "Failed to fetch Vercel project: {$projectNameOrId}");
        }

        return $response->json();
    }

    /**
     * Ensure a Vercel project exists, creating it if it doesn't already exist.
     *
     * @return array<string, mixed>
     */
    public function createOrGetProject(string $projectName): array
    {
        $existing = $this->getProject($projectName);
        if ($existing !== null) {
            return $existing;
        }

        $url = $this->buildUrl('/v10/projects');
        $response = $this->http()->post($url, [
            'name' => $projectName,
            'framework' => null,
        ]);

        $status = $response->status();
        $bodyText = strtolower($response->body());

        if ($status === 409 || ($response->failed() && (str_contains($bodyText, 'already exists') || str_contains($bodyText, 'conflict') || str_contains($bodyText, 'taken')))) {
            throw new VercelProjectNameTakenException(
                projectName: $projectName,
                message: "The subdomain or project name '{$projectName}' is already claimed on Vercel.",
                statusCode: $status,
                responseBody: $response->json() ?? []
            );
        }

        if ($response->failed()) {
            $this->handleErrorResponse($response, "Failed to create Vercel project: {$projectName}");
        }

        return $response->json();
    }

    /**
     * Create a production static deployment for the project.
     *
     * @param  array<int, array<string, string>>  $customHeaders
     * @return array<string, mixed>
     */
    public function createDeployment(string $projectName, string $projectId, string $htmlContent, array $customHeaders = []): array
    {
        $url = $this->buildUrl('/v13/deployments');

        $headers = [
            ['key' => 'X-Content-Type-Options', 'value' => 'nosniff'],
            ['key' => 'X-Frame-Options', 'value' => 'SAMEORIGIN'],
            ['key' => 'Referrer-Policy', 'value' => 'strict-origin-when-cross-origin'],
            ['key' => 'Permissions-Policy', 'value' => 'camera=(), microphone=(), geolocation=()'],
        ];

        foreach ($customHeaders as $header) {
            $headers[] = $header;
        }

        $vercelConfig = [
            'cleanUrls' => true,
            'headers' => [
                [
                    'source' => '/(.*)',
                    'headers' => $headers,
                ],
            ],
        ];

        $payload = [
            'name' => $projectName,
            'project' => $projectId,
            'target' => 'production',
            'projectSettings' => [
                'framework' => null,
            ],
            'files' => [
                [
                    'file' => 'index.html',
                    'data' => $htmlContent,
                    'encoding' => 'utf-8',
                ],
                [
                    'file' => 'vercel.json',
                    'data' => json_encode($vercelConfig, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
                    'encoding' => 'utf-8',
                ],
            ],
        ];

        $response = $this->http()->post($url, $payload);

        if ($response->failed()) {
            $this->handleErrorResponse($response, "Failed to deploy website for project: {$projectName}");
        }

        return $response->json();
    }

    /**
     * Fetch deployment details by deployment ID or URL.
     *
     * @return array<string, mixed>
     */
    public function getDeployment(string $deploymentId): array
    {
        $url = $this->buildUrl("/v13/deployments/{$deploymentId}");
        $response = $this->http()->get($url);

        if ($response->failed()) {
            $this->handleErrorResponse($response, "Failed to fetch Vercel deployment: {$deploymentId}");
        }

        return $response->json();
    }

    /**
     * Verify incoming Vercel webhook signature (x-vercel-signature).
     */
    public function verifyWebhookSignature(string $rawBody, ?string $signature): bool
    {
        if (empty($signature) || empty($this->webhookSecret)) {
            return false;
        }

        $expectedSignature = hash_hmac('sha1', $rawBody, $this->webhookSecret);

        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Handle failed HTTP responses by throwing VercelException.
     *
     * @throws VercelException
     */
    protected function handleErrorResponse(Response $response, string $contextMessage): void
    {
        $body = $response->json() ?? [];
        $apiError = $body['error']['message'] ?? $response->body();
        $code = $response->status();

        Log::error("Vercel API Error: {$contextMessage}", [
            'status' => $code,
            'body' => $body,
        ]);

        throw new VercelException(
            message: "{$contextMessage}: {$apiError}",
            statusCode: $code,
            responseBody: is_array($body) ? $body : []
        );
    }
}
