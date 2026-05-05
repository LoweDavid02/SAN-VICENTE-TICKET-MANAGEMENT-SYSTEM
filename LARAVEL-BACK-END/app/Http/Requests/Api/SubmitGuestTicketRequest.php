<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class SubmitGuestTicketRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Public endpoint - no authentication required
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Guest information (required for non-authenticated submissions)
            'guest_name'    => ['required', 'string', 'min:2', 'max:255'],
            'guest_email'   => ['required', 'email:rfc,dns', 'max:255'],
            'guest_phone'   => ['required', 'string', 'regex:/^[0-9\-\+\(\)\s]+$/', 'min:7', 'max:20'],
            'guest_address' => ['required', 'string', 'min:10', 'max:500'],
            
            // Ticket information
            'title'         => ['required', 'string', 'min:5', 'max:255'],
            'description'   => ['required', 'string', 'min:10', 'max:2000'],
            'category'      => ['required', 'string', 'in:streetlight,drainage,road,waste,water,other'],
            'location'      => ['required', 'string', 'min:5', 'max:255'],
            'latitude'      => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'     => ['nullable', 'numeric', 'between:-180,180'],
            'severity'      => ['required', 'string', 'in:Low,Medium,High'],
            
            // Images (optional)
            'images'        => ['nullable', 'array', 'max:5'],
            'images.*'      => ['string'], // Base64 or HTTPS URLs
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'guest_name.required'    => 'Please provide your full name.',
            'guest_email.required'   => 'Please provide your email address.',
            'guest_email.email'      => 'Please provide a valid email address.',
            'guest_phone.required'   => 'Please provide your contact number.',
            'guest_phone.regex'      => 'Please provide a valid phone number.',
            'guest_address.required' => 'Please provide your complete address.',
            'guest_address.min'      => 'Address must be at least 10 characters.',
            
            'title.required'         => 'Please provide a title for your request.',
            'title.min'              => 'Title must be at least 5 characters.',
            'description.required'   => 'Please describe the issue in detail.',
            'description.min'        => 'Description must be at least 10 characters.',
            'category.required'      => 'Please select a category.',
            'category.in'            => 'Invalid category selected.',
            'location.required'      => 'Please provide the location of the issue.',
            'severity.required'      => 'Please select the urgency level.',
            'severity.in'            => 'Invalid urgency level selected.',
            
            'images.max'             => 'You can upload a maximum of 5 images.',
        ];
    }
}
