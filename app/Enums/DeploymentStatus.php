<?php

namespace App\Enums;

enum DeploymentStatus: string
{
    case NotDeployed = 'not_deployed';
    case Deploying = 'deploying';
    case Building = 'building';
    case Deployed = 'deployed';
    case Ready = 'ready';
    case Failed = 'failed';
    case Error = 'error';
    case Canceled = 'canceled';

    public function label(): string
    {
        return match ($this) {
            self::NotDeployed => 'Not Deployed',
            self::Deploying => 'Deploying',
            self::Building => 'Building',
            self::Deployed => 'Deployed',
            self::Ready => 'Ready',
            self::Failed => 'Failed',
            self::Error => 'Error',
            self::Canceled => 'Canceled',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::Deployed, self::Ready, self::Failed, self::Error, self::Canceled], true);
    }
}
