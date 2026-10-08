<?php

namespace App\Services;

use App\Models\ClientRequest;
use App\Models\ContactEmailer;
use App\Models\Project;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ContactEmailerService
{
    /**
     * Create a new contact emailer for a project, inject the contact form script
     * into the project's html_content, and activate it.
     *
     * @param  array{recipient_email: string, reply_name: string}  $data
     */
    public function create(Project $project, ?ClientRequest $clientRequest, array $data): ContactEmailer
    {
        return DB::transaction(function () use ($project, $clientRequest, $data) {
            $token = (string) Str::uuid();

            $emailer = ContactEmailer::create([
                'project_id' => $project->id,
                'client_request_id' => $clientRequest?->id,
                'recipient_email' => $data['recipient_email'],
                'reply_name' => $data['reply_name'],
                'public_token' => $token,
                'is_active' => true,
            ]);

            $this->injectContactScript($project, $token);

            return $emailer;
        });
    }

    /**
     * Update the emailer's recipient email and/or reply name.
     * Re-injects the script to keep the HTML in sync (token stays the same).
     *
     * @param  array{recipient_email?: string, reply_name?: string}  $data
     */
    public function update(ContactEmailer $emailer, array $data): void
    {
        DB::transaction(function () use ($emailer, $data) {
            $emailer->update($data);
            $this->injectContactScript($emailer->project, $emailer->public_token);
        });
    }

    /**
     * Toggle the emailer's active state.
     * When deactivating, remove the script from html_content so the form
     * goes back to being non-functional on the next deploy.
     */
    public function toggle(ContactEmailer $emailer): void
    {
        DB::transaction(function () use ($emailer) {
            $emailer->update(['is_active' => ! $emailer->is_active]);

            if (! $emailer->is_active) {
                $this->removeContactScript($emailer->project);
            } else {
                $this->injectContactScript($emailer->project, $emailer->public_token);
            }
        });
    }

    /**
     * Inject the StudioSync contact form JavaScript snippet before </body>.
     *
     * The script uses a CSS selector chain to locate the site's contact form,
     * intercepts the submit event, and POSTs to the public API endpoint.
     * The injection is wrapped in SS-EMAILER-START/END markers so it can be
     * cleanly replaced or removed later without corrupting the rest of the HTML.
     */
    public function injectContactScript(Project $project, string $token): void
    {
        $endpoint = url("/api/contact/{$token}");

        $script = <<<SCRIPT
<!-- SS-EMAILER-START -->
<script>
(function () {
  var selectors = [
    'form[data-contact]',
    'form#contact-form',
    'form.contact-form',
    'section#contact form',
    'section.contact form',
    '#contact form',
    '.contact form',
    'form'
  ];
  var form = null;
  for (var i = 0; i < selectors.length; i++) {
    var el = document.querySelector(selectors[i]);
    if (el && el.querySelector('input[type="email"], input[name="email"]')) {
      form = el;
      break;
    }
  }
  if (!form) { return; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nameField   = form.querySelector('[name="name"],[name="full_name"],[name="fullname"],[name="your-name"]');
    var emailField  = form.querySelector('[name="email"],[type="email"],[name="your-email"]');
    var subjectField = form.querySelector('[name="subject"],[name="your-subject"]');
    var messageField = form.querySelector('[name="message"],[name="msg"],[name="body"],[name="your-message"],textarea');
    var data = {
      name:    nameField    ? nameField.value.trim()    : '',
      email:   emailField   ? emailField.value.trim()   : '',
      subject: subjectField ? subjectField.value.trim() : 'Contact Form Message',
      message: messageField ? messageField.value.trim() : '',
    };
    var btn = form.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending\u2026'; }
    fetch('{$endpoint}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json(); })
      .then(function () {
        form.innerHTML = '<div style="text-align:center;padding:2rem 1rem;color:#16a34a;font-size:1.05rem;font-family:inherit;">\u2705 Message sent! We\u2019ll get back to you soon.</div>';
      })
      .catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
        alert('Something went wrong. Please try again.');
      });
  });
})();
</script>
<!-- SS-EMAILER-END -->
SCRIPT;

        $html = $project->html_content ?? '';

        // Remove any existing injection
        $html = preg_replace('/<!-- SS-EMAILER-START -->.*?<!-- SS-EMAILER-END -->/s', '', $html) ?? $html;

        // Inject before </body>, or append if no </body> tag
        $html = str_contains($html, '</body>')
            ? str_replace('</body>', $script."\n</body>", $html)
            : $html.$script;

        $project->update(['html_content' => $html]);
    }

    /**
     * Remove the injected contact form script from the project's html_content.
     * Called when an emailer is deactivated.
     */
    public function removeContactScript(Project $project): void
    {
        $html = $project->html_content ?? '';
        $html = preg_replace('/<!-- SS-EMAILER-START -->.*?<!-- SS-EMAILER-END -->/s', '', $html) ?? $html;
        $project->update(['html_content' => $html]);
    }
}
