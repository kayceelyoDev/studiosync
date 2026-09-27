<?php

namespace App\Http\Requests;

use App\Enums\RequestCategory;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClientRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return ! auth()->user()->hasRole('admin') && ! auth()->user()->hasRole('super_admin');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'project_id' => ['required', 'integer', 'exists:projects,id'],
            'category' => ['required', 'string', Rule::in(array_column(RequestCategory::cases(), 'value'))],
            'title' => ['required_if:category,other', 'nullable', 'string', 'max:100'],
            'description' => ['required', 'string', 'min:20', 'max:5000'],
            'attachment' => ['nullable', 'file', 'max:10240', 'mimes:jpg,jpeg,png,gif,webp,svg,pdf,zip,doc,docx,txt'],
            'assets' => ['nullable', 'array'],
            'assets.*.file' => ['required_with:assets', 'file', 'max:10240', 'mimes:jpg,jpeg,png,gif,webp,svg,pdf,zip,doc,docx,txt'],
            'assets.*.purpose' => ['nullable', 'string', 'max:100'],
            'assets.*.custom_purpose' => ['nullable', 'string', 'max:255'],
            'assets.*.description' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required_if' => 'A title is required when selecting "Other" as the category.',
            'description.min' => 'Please provide at least 20 characters describing your request.',
            'attachment.max' => 'The attached file must not exceed 10MB.',
        ];
    }
}
