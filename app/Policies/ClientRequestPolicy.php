<?php

namespace App\Policies;

use App\Models\ClientRequest;
use App\Models\User;

class ClientRequestPolicy
{
    /**
     * Clients can view their own requests; admins can view any request.
     */
    public function view(User $user, ClientRequest $clientRequest): bool
    {
        return $user->id === $clientRequest->user_id
            || $user->hasRole('admin')
            || $user->hasRole('super_admin');
    }

    /**
     * Only the owning client can submit a new request.
     */
    public function create(User $user): bool
    {
        return ! $user->hasRole('admin') && ! $user->hasRole('super_admin');
    }

    /**
     * Clients can only delete (cancel) their own pending requests.
     */
    public function delete(User $user, ClientRequest $clientRequest): bool
    {
        return $user->id === $clientRequest->user_id
            && $clientRequest->isCancellable();
    }

    /**
     * Only admins may update a request's status and admin notes.
     */
    public function update(User $user, ClientRequest $clientRequest): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin');
    }

    /**
     * Either the owning client or any admin may add a comment.
     */
    public function comment(User $user, ClientRequest $clientRequest): bool
    {
        return $user->id === $clientRequest->user_id
            || $user->hasRole('admin')
            || $user->hasRole('super_admin');
    }
}
