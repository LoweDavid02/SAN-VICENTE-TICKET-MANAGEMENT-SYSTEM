import { useState } from 'react';
import { Upload, MapPin, AlertTriangle } from 'lucide-react';
import ProgressBar from './ProgressBar';

const RequestWizard = ({ onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    photos: [],
    location: '',
    severity: 'Medium',
  });

  const steps = ['Category', 'Details', 'Location', 'Review'];

  const categories = [
    { id: 'streetlight', label: '🔦 Streetlight', icon: '🔦' },
    { id: 'drainage', label: '💧 Drainage', icon: '💧' },
    { id: 'garbage', label: '🗑️ Garbage', icon: '🗑️' },
    { id: 'road', label: '🛣️ Road Damage', icon: '🛣️' },
    { id: 'water', label: '💦 Water Supply', icon: '💦' },
    { id: 'other', label: '📋 Other', icon: '📋' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    onSubmit({ ...formData, trackingNumber: `REQ-${Date.now()}` });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.category !== '';
      case 1: return formData.description.length > 10;
      case 2: return formData.location !== '';
      case 3: return true;
      default: return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ProgressBar steps={steps} currentStep={currentStep} />

      <div className="card p-8 animate-fadeIn">
        {currentStep === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-navy-800 mb-2">What's the Issue?</h2>
            <p className="text-gray-600 mb-8">Select the category that best describes your concern</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`p-6 rounded-lg border-2 transition-all text-center ${
                    formData.category === cat.id
                      ? 'border-teal-500 bg-teal-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <p className="font-medium text-gray-800">{cat.label.split(' ')[1]}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-navy-800 mb-2">Describe the Issue</h2>
            <p className="text-gray-600 mb-6">Provide details that will help our team resolve your concern faster</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please describe the issue in detail..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  rows="6"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length} characters</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-4">Photo Evidence</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors cursor-pointer">
                  <Upload className="mx-auto mb-3 text-gray-400" size={32} />
                  <p className="font-medium text-gray-800">Drag and drop photos here</p>
                  <p className="text-xs text-gray-600">or click to select files</p>
                  <input type="file" multiple accept="image/*" className="hidden" />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-navy-800 mb-2">Location & Severity</h2>
            <p className="text-gray-600 mb-6">Help us pinpoint the exact location and assess urgency</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Location</label>
                <div className="flex items-center gap-2 p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <MapPin className="text-teal-500" size={20} />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter street address or landmark..."
                    className="flex-1 bg-transparent focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">Severity Level</label>
                <div className="grid grid-cols-3 gap-4">
                  {['Low', 'Medium', 'High'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFormData({ ...formData, severity: level })}
                      className={`p-4 rounded-lg border-2 font-medium transition-all ${
                        formData.severity === level
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-700 hover:border-teal-300'
                      }`}
                    >
                      {level === 'High' && <AlertTriangle className="mx-auto mb-2" size={20} />}
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-navy-800 mb-2">Review Your Request</h2>
            <p className="text-gray-600 mb-6">Please review the information before submitting</p>
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
              <div className="border-b border-gray-300 pb-4">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Category</p>
                <p className="font-medium text-gray-800">{formData.category}</p>
              </div>
              <div className="border-b border-gray-300 pb-4">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Description</p>
                <p className="text-gray-800">{formData.description}</p>
              </div>
              <div className="border-b border-gray-300 pb-4">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Location</p>
                <p className="font-medium text-gray-800">{formData.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Severity</p>
                <span className={`inline-block px-3 py-1 rounded-full font-medium text-sm ${
                  formData.severity === 'High' ? 'bg-red-100 text-red-700' :
                  formData.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {formData.severity}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Back
          </button>
          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="ml-auto px-8 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="ml-auto px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
            >
              Submit Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestWizard;
