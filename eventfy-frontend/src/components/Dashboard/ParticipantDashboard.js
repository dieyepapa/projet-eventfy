import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, eventsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { senegalConfig, formatPrice, formatDate } from '../../config/senegalConfig';

const EventCard = ({ event, onRegister, isRegistered = false }) => {
  const navigate = useNavigate();
  
  const formatEventDate = (dateString) => {
    return formatDate(dateString);
  };

  const canRegister = () => {
    if (!event) return false;
    if (event.status !== 'published') return false;
    if (event.max_participants && event.current_participants >= event.max_participants) return false;
    if (new Date(event.start_date) < new Date()) return false;
    return true;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {event.main_image && (
        <img
          src={event.main_image}
          alt={event.title}
          className="w-full h-32 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {event.category?.name || 'Général'}
          </span>
          {event.is_featured && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              ⭐ Mis en avant
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          <button 
            onClick={() => navigate(`/events/${event.id}`)}
            className="hover:text-blue-600 text-left"
          >
            {event.title}
          </button>
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {event.short_description || event.description}
        </p>
        
        <div className="space-y-1 text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatEventDate(event.start_date)}
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.city}
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {event.current_participants}/{event.max_participants || '∞'} participants
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/events/${event.id}`)}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
          >
            Voir détails
          </button>
          
          {isRegistered ? (
            <button
              onClick={() => onRegister(event.id, true)}
              className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Se désinscrire
            </button>
          ) : canRegister() ? (
            <button
              onClick={() => onRegister(event.id, false)}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              S'inscrire
            </button>
          ) : (
            <button
              disabled
              className="flex-1 px-3 py-2 bg-gray-300 text-gray-500 text-sm rounded cursor-not-allowed"
            >
              Complet
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Récupérer mes événements
      const myEventsResponse = await authAPI.getMyEvents();
      const registeredEvents = myEventsResponse.data?.registered_events || [];
      setMyEvents(registeredEvents);
      
      // Créer un Set des IDs d'événements auxquels je suis inscrit
      const registeredIds = new Set(registeredEvents.map(event => event.id));
      setRegisteredEventIds(registeredIds);
      
      // Récupérer tous les événements disponibles
      const allEventsResponse = await eventsAPI.getEvents({ 
        status: 'published',
        ordering: 'start_date'
      });
      const allEvents = allEventsResponse.data.results || allEventsResponse.data || [];
      
      // Filtrer les événements futurs et publics
      const now = new Date();
      const futureEvents = allEvents.filter(event => 
        new Date(event.start_date) > now && 
        event.status === 'published'
      );
      
      setAvailableEvents(futureEvents);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (eventId, isCurrentlyRegistered) => {
    try {
      if (isCurrentlyRegistered) {
        await eventsAPI.unregisterFromEvent(eventId);
        setRegisteredEventIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
      } else {
        await eventsAPI.registerForEvent(eventId);
        setRegisteredEventIds(prev => new Set(prev).add(eventId));
      }
      
      // Refresh data
      await fetchDashboardData();
      
    } catch (err) {
      console.error('Error with registration:', err);
      let errorMessage = 'Erreur lors de l\'inscription';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{senegalConfig.messages.dashboard.participantWelcome}</h1>
        <p className="text-gray-600">Bienvenue {user?.first_name} {user?.last_name} sur Eventfy Sénégal</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mes inscriptions</p>
              <p className="text-2xl font-bold text-gray-900">{myEvents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{senegalConfig.messages.dashboard.stats.upcomingEvents}</p>
              <p className="text-2xl font-bold text-gray-900">
                {myEvents.filter(event => new Date(event.start_date) > new Date()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Événements disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{availableEvents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'available'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Événements disponibles ({availableEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('registered')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'registered'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Mes inscriptions ({myEvents.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'available' ? (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Événements disponibles</h2>
          {availableEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">Aucun événement disponible au Sénégal</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegister={handleRegistration}
                  isRegistered={registeredEventIds.has(event.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Mes inscriptions</h2>
          {myEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">Aucune inscription</div>
              <button
                onClick={() => setActiveTab('available')}
                className="senegal-button px-4 py-2 rounded-md text-sm font-medium"
              >
                Découvrir les événements au Sénégal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegister={handleRegistration}
                  isRegistered={true}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParticipantDashboard;
