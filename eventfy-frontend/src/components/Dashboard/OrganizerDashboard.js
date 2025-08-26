import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, eventsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { senegalConfig, formatPrice, formatDate } from '../../config/senegalConfig';

const StatCard = ({ title, value, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${colorClasses[color]} rounded-md flex items-center justify-center`}>
              <span className="text-white text-sm">{icon}</span>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventRow = ({ event, onEdit, onDelete, onViewParticipants }) => {
  const formatEventDate = (dateString) => {
    return formatDate(dateString);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Brouillon' },
      published: { color: 'bg-green-100 text-green-800', text: 'Publié' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Annulé' },
      completed: { color: 'bg-blue-100 text-blue-800', text: 'Terminé' },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {event.main_image ? (
              <img className="h-10 w-10 rounded-full object-cover" src={event.main_image} alt="" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-xs">📅</span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{event.title}</div>
            <div className="text-sm text-gray-500">{event.category?.name || 'Général'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formatEventDate(event.start_date)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(event.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {event.current_participants} participants
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {event.is_private ? '🔒 Privé' : '🌐 Public'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onViewParticipants(event.id)}
            className="text-green-600 hover:text-green-900"
          >
            Participants
          </button>
          <button
            onClick={() => onEdit(event.id)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Modifier
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="text-red-600 hover:text-red-900"
          >
            Supprimer
          </button>
        </div>
      </td>
    </tr>
  );
};

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getMyEvents();
      const data = response.data;
      
      setStats(data.stats);
      setEvents(data.organized_events || []);
    } catch (err) {
      setError('Erreur lors du chargement du dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${event?.title}" ?`)) {
      try {
        await eventsAPI.deleteEvent(eventId);
        await fetchDashboardData(); // Refresh data
      } catch (err) {
        console.error('Error deleting event:', err);
        alert('Erreur lors de la suppression de l\'événement');
      }
    }
  };

  const handleEditEvent = (eventId) => {
    navigate(`/events/${eventId}/edit`);
  };

  const handleViewParticipants = (eventId) => {
    navigate(`/events/${eventId}/participants`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchDashboardData}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{senegalConfig.messages.dashboard.organizerWelcome}</h1>
        <p className="text-gray-600">Bienvenue {user?.first_name} {user?.last_name} sur Eventfy Sénégal</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Actions rapides</h2>
          <div className="flex space-x-4">
            <Link
              to="/create-event"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              ➕ Créer un événement
            </Link>
            <Link
              to="/categories"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              🏷️ Gérer catégories
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{senegalConfig.messages.dashboard.stats.totalEvents}</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_events || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{senegalConfig.messages.dashboard.stats.totalRegistrations}</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_registrations || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{senegalConfig.messages.dashboard.stats.totalViews}</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_views || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{senegalConfig.messages.dashboard.stats.upcomingEvents}</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.upcoming_events || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{senegalConfig.messages.dashboard.stats.publishedEvents}</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.published_events || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Statistiques</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={senegalConfig.messages.dashboard.stats.totalEvents}
              value={stats.total_events}
              icon="📅"
              color="blue"
            />
            <StatCard
              title={senegalConfig.messages.dashboard.stats.publishedEvents}
              value={stats.published_events}
              icon="✅"
              color="green"
            />
            <StatCard
              title={senegalConfig.messages.dashboard.stats.drafts}
              value={stats.draft_events}
              icon="📝"
              color="yellow"
            />
            <StatCard
              title={senegalConfig.messages.dashboard.stats.totalRegistrations}
              value={stats.total_registrations}
              icon="👥"
              color="purple"
            />
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Mes événements</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos événements et consultez les inscriptions
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Aucun événement créé</div>
            <Link
              to="/create-event"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Créer votre premier événement
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Événement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visibilité
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onViewParticipants={handleViewParticipants}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
