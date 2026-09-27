<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClientRequestCommentRequest;
use App\Models\ClientRequest;
use App\Services\ClientRequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class ClientRequestCommentController extends Controller
{
    public function __construct(private readonly ClientRequestService $service) {}

    /**
     * Add an admin comment to a client request.
     */
    public function store(StoreClientRequestCommentRequest $request, ClientRequest $clientRequest): RedirectResponse
    {
        $this->service->addComment(
            clientRequest: $clientRequest,
            user: Auth::user(),
            body: $request->validated('body'),
            attachment: $request->hasFile('attachment') ? $request->file('attachment') : null,
        );

        return redirect()
            ->route('admin.requests.show', $clientRequest->id)
            ->with('success', 'Reply sent.');
    }
}
