<?php

namespace App\Enums;

enum RequestCategory: string
{
    case EmailIntegration = 'email_integration';
    case BookingSystem = 'booking_system';
    case CustomDomain = 'custom_domain';
    case SslCertificate = 'ssl_certificate';
    case ApiBackendFeature = 'api_backend_feature';
    case AnalyticsIntegration = 'analytics_integration';
    case ChatWidget = 'chat_widget';
    case EcommerceSetup = 'ecommerce_setup';
    case LoginAuthSystem = 'login_auth_system';
    case CmsBlog = 'cms_blog';
    case DesignRevision = 'design_revision';
    case FileUploadFeature = 'file_upload_feature';
    case NewsletterMailing = 'newsletter_mailing';
    case SocialMediaIntegration = 'social_media_integration';
    case MultiLanguage = 'multi_language';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::EmailIntegration => 'Email Integration',
            self::BookingSystem => 'Booking System',
            self::CustomDomain => 'Custom Domain',
            self::SslCertificate => 'SSL Certificate',
            self::ApiBackendFeature => 'API / Backend Feature',
            self::AnalyticsIntegration => 'Analytics Integration',
            self::ChatWidget => 'Live Chat Widget',
            self::EcommerceSetup => 'E-Commerce Setup',
            self::LoginAuthSystem => 'Login / Auth System',
            self::CmsBlog => 'CMS / Blog',
            self::DesignRevision => 'Design Revision',
            self::FileUploadFeature => 'File Upload Feature',
            self::NewsletterMailing => 'Newsletter / Mailing List',
            self::SocialMediaIntegration => 'Social Media Integration',
            self::MultiLanguage => 'Multi-language Support',
            self::Other => 'Other',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::EmailIntegration => 'Set up a contact form that emails directly to your inbox.',
            self::BookingSystem => 'Connect a booking or appointment widget to your website.',
            self::CustomDomain => 'Configure a custom domain to point to your deployed site.',
            self::SslCertificate => 'Set up an SSL certificate for your custom domain.',
            self::ApiBackendFeature => 'Add a custom backend feature, form handler, or API endpoint.',
            self::AnalyticsIntegration => 'Add Google Analytics, Meta Pixel, or similar tracking.',
            self::ChatWidget => 'Embed a live chat widget on your website.',
            self::EcommerceSetup => 'Add a product catalog, cart, or payment integration.',
            self::LoginAuthSystem => 'Add user authentication to your website.',
            self::CmsBlog => 'Add a content management system or blog section.',
            self::DesignRevision => 'Request a redesign or layout change to an existing page.',
            self::FileUploadFeature => 'Allow end-users of your site to upload files.',
            self::NewsletterMailing => 'Integrate a subscription or newsletter form.',
            self::SocialMediaIntegration => 'Embed social feeds or add social share buttons.',
            self::MultiLanguage => 'Add multi-language or localization support.',
            self::Other => 'Describe a custom request not listed above.',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::EmailIntegration => 'Mail',
            self::BookingSystem => 'CalendarDays',
            self::CustomDomain => 'Globe',
            self::SslCertificate => 'ShieldCheck',
            self::ApiBackendFeature => 'Plug',
            self::AnalyticsIntegration => 'BarChart3',
            self::ChatWidget => 'MessageSquare',
            self::EcommerceSetup => 'ShoppingCart',
            self::LoginAuthSystem => 'KeyRound',
            self::CmsBlog => 'FileText',
            self::DesignRevision => 'Paintbrush',
            self::FileUploadFeature => 'FolderUp',
            self::NewsletterMailing => 'Send',
            self::SocialMediaIntegration => 'Share2',
            self::MultiLanguage => 'Languages',
            self::Other => 'Settings',
        };
    }
}
