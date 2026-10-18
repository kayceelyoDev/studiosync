<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('name') && filled($this->input('name'))) {
            $this->merge(['name' => trim((string) $this->input('name'))]);
        }
        if ($this->has('subject') && filled($this->input('subject'))) {
            $this->merge(['subject' => trim((string) $this->input('subject'))]);
        }
        if ($this->has('message') && filled($this->input('message'))) {
            $this->merge(['message' => trim((string) $this->input('message'))]);
        }
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:3', 'max:5000'],
        ];
    }
}
