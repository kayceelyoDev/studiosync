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
        ];
    }
}
