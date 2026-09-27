<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequestCommentRequest;
use App\Models\ClientRequest;
use App\Services\ClientRequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class ClientRequestCommentController extends Controller
{
    public function __construct(private readonly ClientRequestService $service) {}

    /**
     * Add a comment to a client request.
     */
    public function store(StoreClientRequestCommentRequest $request, ClientRequest $clientRequest): RedirectResponse
    {
        $this->authorize('comment', $clientRequest);

        $this->service->addComment(
            clientRequest: $clientRequest,
            user: Auth::user(),
            body: $request->validated('body'),
            attachment: $request->hasFile('attachment') ? $request->file('attachment') : null,
        );

        return redirect()
            ->route('requests.show', $clientRequest->id)
            ->with('success', 'Comment added.');
    }
}
