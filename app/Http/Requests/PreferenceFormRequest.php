<?php

namespace App\Http\Requests;

use App\Models\Workspace;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PreferenceFormRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if (empty($this->workspace_id)) {
            $workspace = Workspace::where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->first();

            if ($workspace) {
                $this->merge([
                    'workspace_id' => $workspace->id,
                ]);
            }
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'workspace_id' => 'required|exists:workspaces,id',
            'project_name' => 'required|string|max:255',
            'preferences' => 'required|array|min:1',
            'assets' => 'nullable|array',
            'assets.*.file' => 'required|file|image|max:10240',
            'assets.*.section' => 'required|string|max:100',
            'assets.*.purpose' => 'required|string|max:100',
            'assets.*.custom_purpose' => 'nullable|string|max:255',
            'assets.*.description' => 'nullable|string|max:500',
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
            'assets.*.file.max' => 'Each image must not exceed 10MB.',
            'assets.*.file.image' => 'The uploaded file must be an image (PNG, JPG, WEBP, or SVG).',
            'assets.*.file.required' => 'An image file is required for each asset entry.',
        ];
    }
}
