<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactEmailerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') || $this->user()?->hasRole('super_admin');
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'recipient_email' => ['required', 'email', 'max:255'],
            'reply_name' => ['required', 'string', 'max:255'],
            'client_request_id' => ['nullable', 'integer', 'exists:client_requests,id'],
        ];
    }
}
