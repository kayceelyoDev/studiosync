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
<style>
@keyframes ss-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
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

    var isSubmitting = false;

    function findVal(selArray) {
      for (var s = 0; s < selArray.length; s++) {
        var el = form.querySelector(selArray[s]);
        if (el && el.value && el.value.trim().length > 0) {
          return el.value.trim();
        }
      }
      return '';
    }

    function showToast(text, isError) {
      var existing = document.getElementById('ss-floating-toast');
      if (existing) existing.remove();

      var t = document.createElement('div');
      t.id = 'ss-floating-toast';
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translate(-50%,10px);z-index:999999;background:#18181b;color:#ffffff;padding:10px 18px;border-radius:9999px;font-size:13px;font-weight:500;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;box-shadow:0 10px 25px -5px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.1);display:inline-flex;align-items:center;gap:8px;pointer-events:none;transition:opacity 0.25s ease,transform 0.25s ease;opacity:0;';

      var iconSvg = isError
        ? '<svg style="width:16px;height:16px;color:#f87171;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
        : '<svg style="width:16px;height:16px;color:#34d399;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';

      t.innerHTML = iconSvg + '<span>' + text + '</span>';
      document.body.appendChild(t);

      requestAnimationFrame(function () {
        t.style.opacity = '1';
        t.style.transform = 'translate(-50%,0)';
      });

      setTimeout(function () {
        t.style.opacity = '0';
        t.style.transform = 'translate(-50%,10px)';
        setTimeout(function () {
          if (t.parentNode) t.parentNode.removeChild(t);
        }, 300);
      }, 3500);
    }

    function handleSubmit(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (isSubmitting) return;

      if (form.checkValidity && !form.checkValidity()) {
        if (form.reportValidity) {
          form.reportValidity();
        }
        return;
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
        showToast('Please enter a valid email address.', true);
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
      var fullMessage = messageParts.join('\\n\\n');

      var btn = form.querySelector('button[type="submit"], input[type="submit"], button:last-of-type');
      var isInput = btn && btn.tagName === 'INPUT';
      var originalBtnHtml = btn ? btn.innerHTML : '';
      var originalBtnValue = btn ? btn.value : '';

      if (btn) {
        btn.disabled = true;
        var btnRect = btn.getBoundingClientRect();
        if (btnRect.width > 0) {
          btn.style.minWidth = btnRect.width + 'px';
        }
        btn.style.opacity = '0.85';
        btn.style.cursor = 'wait';

        if (isInput) {
          btn.value = 'Sending...';
        } else {
          btn.innerHTML = '<span style="display:inline-flex;align-items:center;justify-content:center;gap:8px;"><svg style="width:1.15em;height:1.15em;animation:ss-spin 0.75s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg><span>Sending...</span></span>';
        }
      }

      isSubmitting = true;

      var configuredEndpoint = '{$endpoint}';
      var endpoint = configuredEndpoint;
      try {
        var hostOrigin = (window.parent && window.parent.location && window.parent.location.origin)
          ? window.parent.location.origin
          : ((window.location && window.location.origin && window.location.origin !== 'null') ? window.location.origin : '');
        if (hostOrigin && (hostOrigin.indexOf('localhost') !== -1 || hostOrigin.indexOf('127.0.0.1') !== -1)) {
          endpoint = hostOrigin + '/api/contact/{$token}';
        }
      } catch (e) {}

      fetch(endpoint, {
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
        form.reset();
        showToast('Message sent successfully!', false);

        if (btn) {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.cursor = '';
          if (isInput) {
            btn.value = 'Sent!';
          } else {
            btn.innerHTML = '<span style="display:inline-flex;align-items:center;justify-content:center;gap:8px;"><svg style="width:1.15em;height:1.15em;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Sent!</span></span>';
          }
          setTimeout(function () {
            if (isInput) {
              btn.value = originalBtnValue;
            } else {
              btn.innerHTML = originalBtnHtml;
            }
            btn.style.minWidth = '';
          }, 3500);
        }

        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'SS_CONTACT_SUBMITTED', success: true }, '*');
          }
        } catch (e) {}
      })
      .catch(function (err) {
        showToast(err.message || 'Something went wrong. Please try again.', true);
        if (btn) {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.cursor = '';
          if (isInput) {
            btn.value = originalBtnValue;
          } else {
            btn.innerHTML = originalBtnHtml;
          }
          btn.style.minWidth = '';
        }
      })
      .finally(function () {
        isSubmitting = false;
      });
    }

    form.onsubmit = handleSubmit;
    form.addEventListener('submit', handleSubmit, true);

    var submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitBtn) {
      submitBtn.addEventListener('click', function (e) {
        handleSubmit(e);
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

    public const SECTION_START_TAG = '<!-- SS-CONTACT-FORM-START -->';

    public const SECTION_END_TAG = '<!-- SS-CONTACT-FORM-END -->';

    /**
     * Check if the project's HTML contains a contact form or contact section.
     */
    public function hasContactForm(Project $project): bool
    {
        $html = strtolower($project->html_content ?? '');

        return str_contains($html, 'id="contact"')
            || str_contains($html, 'id="contact-form"')
            || str_contains($html, 'data-contact')
            || str_contains($html, 'class="contact-form"')
            || str_contains($html, '<form');
    }

    /**
     * Inject a clean, responsive Contact Us section into the project's HTML content.
     */
    public function injectContactSection(Project $project): bool
    {
        $html = $project->html_content ?? '';
        if (empty($html)) {
            return false;
        }

        // Clean out any existing injected contact form section
        $cleanHtml = preg_replace('/<!-- SS-CONTACT-FORM-START -->.*?<!-- SS-CONTACT-FORM-END -->/s', '', $html) ?? $html;

        $snippet = <<<'HTML'
<!-- SS-CONTACT-FORM-START -->
<section id="contact" style="padding: 60px 20px; max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h2 style="font-size: 28px; font-weight: 700; color: #18181b; margin-bottom: 8px;">Contact Us</h2>
    <p style="font-size: 14px; color: #71717a;">Send us a message and we will respond as soon as possible.</p>
  </div>
  <form id="contact-form" data-contact style="display: flex; flex-direction: column; gap: 16px; background: #ffffff; padding: 28px; border-radius: 16px; border: 1px solid #e4e4e7; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <label for="contact-name" style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #3f3f46; letter-spacing: 0.5px;">Your Name</label>
      <input type="text" id="contact-name" name="name" required placeholder="John Doe" style="padding: 10px 14px; border: 1px solid #d4d4d8; border-radius: 8px; font-size: 14px; outline: none; background: #ffffff; color: #18181b;" />
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <label for="contact-email" style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #3f3f46; letter-spacing: 0.5px;">Email Address</label>
      <input type="email" id="contact-email" name="email" required placeholder="john@example.com" style="padding: 10px 14px; border: 1px solid #d4d4d8; border-radius: 8px; font-size: 14px; outline: none; background: #ffffff; color: #18181b;" />
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <label for="contact-subject" style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #3f3f46; letter-spacing: 0.5px;">Subject</label>
      <input type="text" id="contact-subject" name="subject" placeholder="General Inquiry" style="padding: 10px 14px; border: 1px solid #d4d4d8; border-radius: 8px; font-size: 14px; outline: none; background: #ffffff; color: #18181b;" />
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <label for="contact-message" style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #3f3f46; letter-spacing: 0.5px;">Message</label>
      <textarea id="contact-message" name="message" required rows="4" placeholder="Write your message here..." style="padding: 10px 14px; border: 1px solid #d4d4d8; border-radius: 8px; font-size: 14px; outline: none; resize: vertical; background: #ffffff; color: #18181b;"></textarea>
    </div>
    <button type="submit" style="padding: 12px 20px; background-color: #4f46e5; color: #ffffff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s ease;">
      Send Message
    </button>
  </form>
</section>
<!-- SS-CONTACT-FORM-END -->
HTML;

        // Best injection point: before <footer>, before SS-EMAILER-START, or before </body>
        if (stripos($cleanHtml, '<footer') !== false) {
            $injectedHtml = preg_replace('/<footer/i', $snippet."\n<footer", $cleanHtml, 1);
        } elseif (stripos($cleanHtml, '<!-- SS-EMAILER-START -->') !== false) {
            $injectedHtml = str_replace('<!-- SS-EMAILER-START -->', $snippet."\n<!-- SS-EMAILER-START -->", $cleanHtml);
        } elseif (stripos($cleanHtml, '</body>') !== false) {
            $injectedHtml = preg_replace('/<\/body>/i', $snippet."\n</body>", $cleanHtml, 1);
        } else {
            $injectedHtml = $cleanHtml."\n".$snippet;
        }

        $project->update(['html_content' => $injectedHtml]);

        return true;
    }

    /**
     * Remove any injected contact form section.
     */
    public function removeContactSection(Project $project): bool
    {
        $html = $project->html_content ?? '';
        if (empty($html)) {
            return false;
        }

        $cleanHtml = preg_replace('/<!-- SS-CONTACT-FORM-START -->.*?<!-- SS-CONTACT-FORM-END -->/s', '', $html) ?? $html;
        $project->update(['html_content' => $cleanHtml]);

        return true;
    }
}
