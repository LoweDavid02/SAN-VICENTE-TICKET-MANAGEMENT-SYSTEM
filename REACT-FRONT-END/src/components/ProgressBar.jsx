import { AlertCircle, CheckCircle, Clock, User } from 'lucide-react';

const ProgressBar = ({ steps, currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                index < currentStep
                  ? 'bg-success text-white'
                  : index === currentStep
                  ? 'bg-teal-500 text-white ring-4 ring-teal-200'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-1 w-full mx-2 mt-5 rounded-full ${
                  index < currentStep - 1 ? 'bg-success' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600 px-1">
        {steps.map((step) => (
          <span key={step} className="text-center">{step}</span>
        ))}
      </div>
    </div>
  );
};

export const TicketProgress = ({ status, stages }) => {
  const stageIndex = stages.indexOf(status);

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <h3 className="font-semibold text-gray-800 mb-4">Resolution Progress</h3>
      <div className="space-y-3">
        {stages.map((stage, index) => (
          <div key={stage} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index < stageIndex
                  ? 'bg-success text-white'
                  : index === stageIndex
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {index < stageIndex ? '✓' : index + 1}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${index <= stageIndex ? 'text-gray-800' : 'text-gray-500'}`}>
                {stage}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
