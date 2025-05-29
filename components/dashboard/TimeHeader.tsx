// src/components/dashboard/TimeHeader.tsx
interface TimeHeaderProps {
  currentTime: Date;
}

export default function TimeHeader({ currentTime }: TimeHeaderProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600 mb-2">
          🕐 {formatTime(currentTime)}
        </div>
        <div className="text-lg text-gray-600 capitalize">
          {formatDate(currentTime)}
        </div>
      </div>
    </div>
  );
}