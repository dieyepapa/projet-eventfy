import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI, eventsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MyEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('upcoming'); // upcoming, past, all

  useEffect(() => {
    fetchMyEvents();
  }, [filter]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getMyEvents();
      // L'API retourne { organized_events: [], registered_events: [], stats: {} }
      let filteredEvents = response.data?.registered_events || [];
      
      const now = new Date();
      
      if (filter === 'upcoming') {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.start_date) >= now
        );
      } else if (filter === 'past') {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.end_date) < now
        );
      }
      
      // Sort by start date
      filteredEvents.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      
      setEvents(filteredEvents);
    } catch (err) {
      setError('Erreur lors du chargement de vos événements');
      console.error('Error fetching my events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (eventId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir vous désinscrire de cet événement ?')) {
      return;
    }

    try {
      await eventsAPI.unregisterFromEvent(eventId);
      await fetchMyEvents(); // Refresh the list
    } catch (err) {
      console.error('Error unregistering from event:', err);
      alert('Erreur lors de la désinscription');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    if (endDate < now) return { text: 'Terminé', color: 'gray' };
    if (startDate <= now && endDate >= now) return { text: 'En cours', color: 'green' };
    if (startDate > now) return { text: 'À venir', color: 'blue' };
    return { text: 'Inconnu', color: 'gray' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mes événements</h1>
        <p className="text-gray-600">Gérez vos inscriptions aux événements</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setFilter('upcoming')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'upcoming'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              À venir
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'past'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Passés
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tous
            </button>
          </nav>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {filter === 'upcoming' ? 'Aucun événement à venir' :
             filter === 'past' ? 'Aucun événement passé' :
             'Aucun événement'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'upcoming' 
              ? 'Inscrivez-vous à des événements pour les voir ici !'
              : 'Vous n\'avez participé à aucun événement pour le moment.'
            }
          </p>
          {filter === 'upcoming' && (
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Découvrir des événements
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const status = getEventStatus(event);
            return (
              <div key={event.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          <Link 
                            to={`/events/${event.id}`}
                            className="hover:text-primary-600"
                          >
                            {event.title}
                          </Link>
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          status.color === 'green' ? 'bg-green-100 text-green-800' :
                          status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {status.text}
                        </span>
                        {event.category && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {event.category.name}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <div className="font-medium">Début</div>
                            <div>{formatDate(event.start_date)}</div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div>
                            <div className="font-medium">Lieu</div>
                            <div>{event.location}, {event.city}</div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <div>
                            <div className="font-medium">Prix</div>
                            <div>{event.is_free ? 'Gratuit' : `${event.price}€`}</div>
                          </div>
                        </div>
                      </div>

                      {event.short_description && (
                        <p className="mt-3 text-gray-600 text-sm">
                          {event.short_description}
                        </p>
                      )}
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <Link
                        to={`/events/${event.id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Voir détails
                      </Link>
                      
                      {status.text === 'À venir' && (
                        <button
                          onClick={() => handleUnregister(event.id)}
                          className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                        >
                          Se désinscrire
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyEvents;
