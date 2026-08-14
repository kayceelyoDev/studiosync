<?php

namespace App\Http\Controllers;

use App\Http\Requests\PreferenceFormRequest;
use App\Models\Workspaces;
use App\Services\GeneratePromptServices;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GenerateAiPromtPage extends Controller
{
    public function index()
    {
        return Inertia::render('GenerateAiPrompt/Index');
    }

    public function showProject()
    {
        $data = Workspaces::select('id', 'project_name', 'status', 'project_url', 'created_at')
            ->where('user_id', Auth::user()->id)
            ->get();

        return Inertia::render('dashboard', [
            'projects' => $data,
        ]);
    }

    public function generatePrompt(PreferenceFormRequest $request, GeneratePromptServices $generatePromptServices)
    {
        // Validate the request data
        $data = $request->validated();

        // Generate the prompt using the service (saves to DB internally)
        $generatePromptServices->generatePrompt($data);

        // Do not return the prompt to the user, as it is admin-only.
        return response()->json([
            'success' => true,
            'message' => 'Your preferences have been successfully submitted and are waiting for admin review!',
        ]);
    }
}
