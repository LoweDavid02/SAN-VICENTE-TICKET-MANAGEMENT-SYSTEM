<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string', 'min:6'],
            'portal'   => ['required', 'string', 'in:admin,resident,personnel'],
        ];
    }

    public function messages(): array
    {
        return [
            'portal.in' => 'Portal must be one of: admin, resident, or personnel.',
        ];
    }
}
