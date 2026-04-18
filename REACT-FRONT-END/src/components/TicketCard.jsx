import { MapPin, Calendar, AlertCircle } from 'lucide-react';

const TicketCard = ({ ticket, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'URGENT':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100 text-red-700' };
      case 'IN PROGRESS':
        return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' };
      case 'PENDING':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' };
      case 'RESOLVED':
        return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', badge: 'bg-green-100 text-green-700' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700' };
    }
  };

  const colors = getStatusColor(ticket.status);

  const getProgressPercentage = (status) => {
    const statusMap = { 'PENDING': 25, 'IN PROGRESS': 50, 'RESOLVED': 100 };
    return statusMap[status] || 0;
  };

  return (
    <div
      onClick={onClick}
      className={`card p-6 cursor-pointer hover:shadow-lg transition-all duration-200 ${colors.bg} border-2 ${colors.border}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-mono text-gray-600">#{ticket.id}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${colors.badge}`}>
              {ticket.status}
            </span>
          </div>
          <h3 className="font-bold text-gray-800">{ticket.title}</h3>
        </div>
        {ticket.severity === 'High' && (
          <AlertCircle className="text-danger" size={20} />
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4">{ticket.description}</p>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} />
          <span>{ticket.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>{ticket.date}</span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-medium text-gray-700">Progress</span>
            <span className="text-gray-600">{getProgressPercentage(ticket.status)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-300"
              style={{ width: `${getProgressPercentage(ticket.status)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-300">
        <p className="text-xs text-gray-500">Last updated: {ticket.lastUpdated}</p>
      </div>
    </div>
  );
};

export default TicketCard;
