<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class CreateUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100', 'regex:/^[\pL\s\-]+$/u'],
            'last_name'  => ['required', 'string', 'max:100', 'regex:/^[\pL\s\-]+$/u'],
            'email'      => ['required', 'string', 'email:rfc', 'max:255', 'unique:users,email'],
            'password'   => ['required', 'string', 'min:8', 'max:128',
                             'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'],
            // Admin can create any portal type; residents cannot use this endpoint.
            'portal'     => ['required', 'string', 'in:admin,personnel'],
        ];
    }

    public function messages(): array
    {
        return [
            'password.regex'   => 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
            'first_name.regex' => 'First name may only contain letters, spaces, and hyphens.',
            'last_name.regex'  => 'Last name may only contain letters, spaces, and hyphens.',
        ];
    }
}
