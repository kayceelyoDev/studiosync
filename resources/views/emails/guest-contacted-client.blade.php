<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Message</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

                    {{-- Header --}}
                    <tr>
                        <td style="background-color:#6366f1;border-radius:12px 12px 0 0;padding:28px 32px;">
                            <p style="margin:0;font-size:13px;font-weight:600;color:#c7d2fe;letter-spacing:0.05em;text-transform:uppercase;">StudioSync</p>
                            <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;">New Contact Message</h1>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="background-color:#ffffff;padding:32px;border-left:1px solid #e4e4e7;border-right:1px solid #e4e4e7;">

                            <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;">
                                You have a new message from
                                <strong style="color:#18181b;">{{ $contactMessage->guest_name }}</strong>
                                via your website's contact form.
                            </p>

                            {{-- Guest info --}}
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background-color:#f9f9fb;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;">
                                <tr>
                                    <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;">
                                        <span style="display:block;font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px;">From</span>
                                        <span style="font-size:14px;color:#18181b;font-weight:500;">{{ $contactMessage->guest_name }}</span>
                                        &nbsp;
                                        <a href="mailto:{{ $contactMessage->guest_email }}" style="font-size:14px;color:#6366f1;text-decoration:none;">{{ $contactMessage->guest_email }}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 16px;">
                                        <span style="display:block;font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px;">Subject</span>
                                        <span style="font-size:14px;color:#18181b;font-weight:500;">{{ $contactMessage->subject }}</span>
                                    </td>
                                </tr>
                            </table>

                            {{-- Message --}}
                            <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;">Message</p>
                            <div style="background-color:#f9f9fb;border:1px solid #e4e4e7;border-left:4px solid #6366f1;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:28px;">
                                <p style="margin:0;font-size:15px;color:#18181b;line-height:1.7;white-space:pre-wrap;">{{ $contactMessage->message }}</p>
                            </div>

                            {{-- CTA --}}
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="mailto:{{ $contactMessage->guest_email }}"
                                           style="display:inline-block;background-color:#6366f1;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;">
                                            Reply to {{ $contactMessage->guest_name }}
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="background-color:#f4f4f5;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
                            <p style="margin:0;font-size:12px;color:#71717a;line-height:1.6;">
                                💡 You can also hit <strong>Reply</strong> in your email client to respond directly to
                                <strong>{{ $contactMessage->guest_name }}</strong>.<br>
                                This message was received via your StudioSync contact form.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
