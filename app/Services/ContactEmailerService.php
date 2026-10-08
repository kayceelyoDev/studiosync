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
  function initContactForm() {
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
      var candidate = document.querySelector(selectors[i]);
      if (candidate && candidate.querySelector('input[type="email"], input[name*="email" i], input[id*="email" i]')) {
        form = candidate;
        break;
      }
    }
    if (!form) {
      var allForms = document.querySelectorAll('form');
      if (allForms.length > 0) {
        form = allForms[allForms.length - 1];
      }
    }
    if (!form) return;

    function findVal(selArray) {
      for (var s = 0; s < selArray.length; s++) {
        var el = form.querySelector(selArray[s]);
        if (el && el.value && el.value.trim().length > 0) {
          return el.value.trim();
        }
      }
      return '';
    }

    function showBanner(text, isSuccess) {
      var existing = form.querySelector('#ss-status-banner');
      if (existing) existing.remove();
      var b = document.createElement('div');
      b.id = 'ss-status-banner';
      b.style.cssText = 'padding:14px 18px;margin:14px 0;border-radius:8px;font-size:13px;font-weight:600;line-height:1.5;text-align:center;transition:all 0.3s ease;' +
        (isSuccess ? 'background:#10b981;color:#ffffff;box-shadow:0 4px 12px rgba(16,185,129,0.3);' : 'background:#ef4444;color:#ffffff;box-shadow:0 4px 12px rgba(239,68,68,0.3);');
      b.innerHTML = text;
      var btn = form.querySelector('button[type="submit"], input[type="submit"], button:last-of-type');
      if (btn && btn.parentNode) {
        btn.parentNode.insertBefore(b, btn);
      } else {
        form.appendChild(b);
      }
    }

    function handleSubmit(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      var name = findVal([
        'input[id*="name" i]',
        'input[name*="name" i]',
        'input[placeholder*="name" i]',
        'input[type="text"]'
      ]) || 'Website Visitor';

      var email = findVal([
        'input[type="email"]',
        'input[id*="email" i]',
        'input[name*="email" i]',
        'input[placeholder*="email" i]'
      ]);

      if (!email) {
        showBanner('\u26A0\uFE0F Please enter a valid email address.', false);
        return;
      }

      var phone = findVal([
        'input[type="tel"]',
        'input[id*="phone" i]',
        'input[name*="phone" i]',
        'input[placeholder*="phone" i]'
      ]);

      var selectEl = form.querySelector('select');
      var tier = selectEl && selectEl.selectedIndex >= 0 ? selectEl.options[selectEl.selectedIndex].text : '';

      var subject = findVal([
        'input[id*="subject" i]',
        'input[name*="subject" i]',
        'input[placeholder*="subject" i]'
      ]) || (tier ? 'Inquiry: ' + tier : 'New Website Contact Inquiry');

      var rawMessage = findVal([
        'textarea',
        'input[id*="message" i]',
        'input[name*="message" i]',
        'input[placeholder*="message" i]'
      ]);

      var messageParts = [];
      if (phone) messageParts.push('Phone: ' + phone);
      if (tier && tier !== subject) messageParts.push('Inquiry Tier: ' + tier);
      if (rawMessage) {
        messageParts.push(rawMessage);
      } else {
        messageParts.push('Inquiry submitted through website contact form.');
      }
      var fullMessage = messageParts.join('\n\n');

      var btn = form.querySelector('button[type="submit"], input[type="submit"], button:last-of-type');
      var originalBtnHtml = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.7';
        btn.innerHTML = '<span>\u23F3 Transmitting Inquiry\u2026</span>';
      }

      showBanner('\uD83D\uDCE1 Transmitting your inquiry\u2026', true);

      fetch('{$endpoint}', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          subject: subject,
          message: fullMessage
        })
      })
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) {
            var msg = data.message || (data.errors ? Object.values(data.errors).flat().join(' ') : 'Submission failed');
            throw new Error(msg);
          }
          return data;
        });
      })
      .then(function () {
        showBanner('\u2705 Inquiry Sent Successfully! Your message has been routed to the owner inbox.', true);
        form.reset();
        if (btn) {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.innerHTML = '<span>\u2713 Sent!</span>';
          setTimeout(function () { btn.innerHTML = originalBtnHtml; }, 4000);
        }
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'SS_CONTACT_SUBMITTED', success: true }, '*');
          }
        } catch (e) {}
      })
      .catch(function (err) {
        showBanner('\u26A0\uFE0F ' + (err.message || 'Something went wrong. Please try again.'), false);
        if (btn) {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.innerHTML = originalBtnHtml;
        }
      });
    }

    form.onsubmit = handleSubmit;
    form.addEventListener('submit', handleSubmit, true);

    var submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitBtn) {
      submitBtn.addEventListener('click', function (e) {
        if (!form.checkValidity || form.checkValidity()) {
          handleSubmit(e);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
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
