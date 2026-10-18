<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ContactMessageController extends Controller
{
    /**
     * Display all contact messages received for a client's project.
     * Read-only — clients can view but not manage their emailer config.
     */
    public function index(Project $project): Response
    {
        abort_if($project->user_id !== Auth::id(), 403);
        abort_unless($project->contactEmailer()->exists(), 404);

        $emailer = $project->contactEmailer;

        $messages = $emailer
            ->messages()
            ->latest('created_at')
            ->paginate(20)
            ->through(fn ($m) => [
                'id' => $m->id,
                'guest_name' => $m->guest_name,
                'guest_email' => $m->guest_email,
                'subject' => $m->subject,
                'message' => $m->message,
                'created_at' => $m->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Project/ContactMessages', [
            'project' => [
                'id' => $project->id,
                'project_name' => $project->project_name,
                'workspace_id' => $project->workspace_id,
            ],
            'emailer' => [
                'is_active' => $emailer->is_active,
                'recipient_email' => $emailer->recipient_email,
            ],
            'messages' => $messages,
        ]);
    }
}
