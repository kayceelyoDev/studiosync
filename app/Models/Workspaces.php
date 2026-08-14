<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Workspaces extends Model
{
    //
    protected $fillable = [
        'user_id',
        'project_name',
        'preferences',
        'generated_prompt',
        'status',
        'project_url',
    ];
}
