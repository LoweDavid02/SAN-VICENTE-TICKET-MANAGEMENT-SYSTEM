<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class SubmitTicketRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:10', 'max:5000'],
            'category'    => ['required', 'string', 'in:streetlight,drainage,road,waste,water,other'],
            'location'    => ['required', 'string', 'max:255'],
            'severity'    => ['required', 'in:Low,Medium,High'],
            // Accept base64 data URIs or HTTPS URLs only
            'images'      => ['nullable', 'array', 'max:5'],
            'images.*'    => ['nullable', 'string', 'max:2097152',
                              'regex:/^(data:image\/(jpeg|png|gif|webp);base64,[A-Za-z0-9+\/]+=*|https:\/\/.+)$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'category.in'   => 'Invalid category selected.',
            'images.*.regex'=> 'Each image must be a valid base64 image or HTTPS URL.',
        ];
    }
}
