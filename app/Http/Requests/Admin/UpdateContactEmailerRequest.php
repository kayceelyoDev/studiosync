<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContactEmailerRequest extends FormRequest
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
            'recipient_email' => ['sometimes', 'required', 'email', 'max:255'],
            'reply_name' => ['sometimes', 'required', 'string', 'max:255'],
        ];
    }
}
