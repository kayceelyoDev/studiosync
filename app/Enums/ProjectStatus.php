<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Pending = 'pending';
    case GeneratingHtml = 'generating_html';
    case ReviewingHtml = 'reviewing_html';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Deployed = 'deployed';
    case Failed = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::GeneratingHtml => 'Generating HTML',
            self::ReviewingHtml => 'Reviewing HTML',
            self::InProgress => 'In Progress',
            self::Completed => 'Completed',
            self::Deployed => 'Deployed',
            self::Failed => 'Failed',
        };
    }
}
