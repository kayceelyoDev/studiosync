<?php

namespace App\Services;

use App\Models\Project;

class BookingCodeInjectionService
{
    public const START_TAG = '<!-- SS-BOOKING-CTA-START -->';

    public const END_TAG = '<!-- SS-BOOKING-CTA-END -->';

    /**
     * Inject or update the "Book Now" CTA in the project's HTML content.
     */
    public function injectBookingCta(Project $project): bool
    {
        $html = $project->html_content;

        if (empty($html)) {
            return false;
        }

        $entryUrl = url("/book/entry/{$project->booking_public_token}");

        // Strip existing injection if present
        $cleanHtml = $this->stripExistingCta($html);

        $ctaSnippet = $this->buildCtaSnippet($entryUrl);

        // Best injection point heuristic:
        // 1. Inside <nav>, right before </nav>
        // 2. Inside <header>, right before </header>
        // 3. Before </body> (as a stylish floating button)
        // 4. Append to end
        if (stripos($cleanHtml, '</nav>') !== false) {
            $injectedHtml = preg_replace('/<\/nav>/i', $ctaSnippet."\n</nav>", $cleanHtml, 1);
        } elseif (stripos($cleanHtml, '</header>') !== false) {
            $injectedHtml = preg_replace('/<\/header>/i', $ctaSnippet."\n</header>", $cleanHtml, 1);
        } elseif (stripos($cleanHtml, '</body>') !== false) {
            $floatingSnippet = $this->buildFloatingCtaSnippet($entryUrl);
            $injectedHtml = preg_replace('/<\/body>/i', $floatingSnippet."\n</body>", $cleanHtml, 1);
        } else {
            $injectedHtml = $cleanHtml."\n".$ctaSnippet;
        }

        $project->update(['html_content' => $injectedHtml]);

        return true;
    }

    /**
     * Remove the injected booking CTA from the project's HTML content.
     */
    public function removeBookingCta(Project $project): bool
    {
        $html = $project->html_content;

        if (empty($html)) {
            return false;
        }

        $cleanHtml = $this->stripExistingCta($html);

        $project->update(['html_content' => $cleanHtml]);

        return true;
    }

    /**
     * Check if the project currently has the booking CTA injected.
     */
    public function hasBookingCta(Project $project): bool
    {
        return str_contains($project->html_content ?? '', self::START_TAG);
    }

    /**
     * Get the embed snippet that can be copied and manually pasted into HTML.
     */
    public function getEmbedSnippet(Project $project): string
    {
        $entryUrl = url("/book/entry/{$project->booking_public_token}");

        return $this->buildCtaSnippet($entryUrl);
    }

    protected function stripExistingCta(string $html): string
    {
        $pattern = '/'.preg_quote(self::START_TAG, '/').'.*?'.preg_quote(self::END_TAG, '/').'/s';

        return preg_replace($pattern, '', $html) ?? $html;
    }

    protected function buildCtaSnippet(string $entryUrl): string
    {
        $start = self::START_TAG;
        $end = self::END_TAG;

        return <<<HTML
{$start}
<a href="{$entryUrl}" class="ss-booking-cta-btn" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;background-color:#10b981;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;text-decoration:none;box-shadow:0 2px 8px rgba(16,185,129,0.25);transition:all 0.2s ease;">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
  <span>Book Now</span>
</a>
{$end}
HTML;
    }

    protected function buildFloatingCtaSnippet(string $entryUrl): string
    {
        $start = self::START_TAG;
        $end = self::END_TAG;

        return <<<HTML
{$start}
<div id="ss-booking-floating-widget" style="position:fixed;bottom:24px;right:24px;z-index:99999;">
  <a href="{$entryUrl}" class="ss-booking-cta-btn" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:10px;padding:12px 22px;background-color:#10b981;color:#ffffff;font-size:14px;font-weight:600;border-radius:50px;text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,0.25);transition:all 0.2s ease;">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
    <span>Book an Appointment</span>
  </a>
</div>
{$end}
HTML;
    }
}
