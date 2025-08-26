import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getEvent(id);
      setEvent(response.data);
      
      // Check if user is already registered
      if (isAuthenticated && user) {
        // Check via API call to get current registration status
        try {
          const myEventsResponse = await authAPI.getMyEvents();
          const registeredEvents = myEventsResponse.data?.registered_events || [];
          const isUserRegistered = registeredEvents.some(event => event.id === parseInt(id));
          setIsRegistered(isUserRegistered);
        } catch (err) {
          console.log('Could not check registration status:', err);
          setIsRegistered(false);
        }
      }
    } catch (err) {
      setError('Événement non trouvé');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    console.log('Starting registration process for event:', id);
    console.log('User authenticated:', isAuthenticated);
    console.log('Currently registered:', isRegistered);

    try {
      setRegistering(true);
      if (isRegistered) {
        console.log('Attempting to unregister...');
        await eventsAPI.unregisterFromEvent(id);
        setIsRegistered(false);
        console.log('Unregistration successful');
      } else {
        console.log('Attempting to register...');
        const response = await eventsAPI.registerForEvent(id);
        console.log('Registration response:', response);
        setIsRegistered(true);
        console.log('Registration successful');
      }
      // Refresh event data to update participant count
      await fetchEvent();
    } catch (err) {
      console.error('Error with registration:', err);
      console.error('Full error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error config:', err.config);
      
      // Display specific error message if available
      let errorMessage = 'Erreur lors de l\'inscription. Veuillez réessayer.';
      
      if (err.response?.status === 404) {
        errorMessage = 'Endpoint d\'inscription non trouvé. Vérifiez que le serveur Django fonctionne.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Vous devez être connecté pour vous inscrire.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Vous n\'avez pas l\'autorisation de vous inscrire à cet événement.';
      } else if (err.response?.data) {
        console.log('Error data:', err.response.data);
        
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.event) {
          // Handle validation errors from serializer
          const eventErrors = err.response.data.event;
          if (Array.isArray(eventErrors)) {
            errorMessage = eventErrors[0];
          }
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0];
        }
      } else if (err.message) {
        errorMessage = `Erreur réseau: ${err.message}`;
      }
      
      console.log('Final error message:', errorMessage);
      alert(errorMessage);
    } finally {
      setRegistering(false);
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

  const canRegister = () => {
    if (!event) return false;
    if (event.status !== 'published') return false;
    if (event.max_participants && event.current_participants >= event.max_participants) return false;
    if (new Date(event.start_date) < new Date()) return false;
    return true;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Événement non trouvé</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Image */}
      {event.main_image && (
        <div className="mb-8">
          <img
            src={event.main_image}
            alt={event.title}
            className="w-full h-64 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Title and Category */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {event.category?.name || 'Général'}
              </span>
              {event.is_featured && (
                <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  ⭐ Mis en avant
                </span>
              )}
              {event.is_private && (
                <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  🔒 Privé
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
            {event.short_description && (
              <p className="text-xl text-gray-600">{event.short_description}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
            </div>
          </div>

          {/* Organizer Info */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Organisateur</h3>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                {event.organizer?.first_name?.[0]}{event.organizer?.last_name?.[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {event.organizer?.first_name} {event.organizer?.last_name}
                </p>
                <p className="text-sm text-gray-600">{event.organizer?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
            {/* Date and Time */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📅 Date et heure</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Début :</span>
                  <p className="text-gray-600">{formatDate(event.start_date)}</p>
                </div>
                <div>
                  <span className="font-medium">Fin :</span>
                  <p className="text-gray-600">{formatDate(event.end_date)}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📍 Lieu</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{event.location}</p>
                <p className="text-gray-600">{event.address}</p>
                <p className="text-gray-600">
                  {event.city} {event.postal_code}
                </p>
                <p className="text-gray-600">{event.country}</p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💰 Prix</h3>
              <div className="text-2xl font-bold">
                {event.is_free ? (
                  <span className="text-green-600">Gratuit</span>
                ) : (
                  <span className="text-gray-900">{event.price}€</span>
                )}
              </div>
            </div>

            {/* Participants */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">👥 Participants</h3>
              <div className="text-sm">
                <p>
                  <span className="font-medium">{event.current_participants || 0}</span> inscrits
                </p>
                {event.max_participants && (
                  <p className="text-gray-600">
                    sur {event.max_participants} places maximum
                  </p>
                )}
              </div>
            </div>

            {/* Registration Button */}
            <div className="mb-4">
              {!isAuthenticated ? (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                >
                  Se connecter pour s'inscrire
                </button>
              ) : canRegister() ? (
                <button
                  onClick={handleRegistration}
                  disabled={registering}
                  className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                    isRegistered
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {registering ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Traitement...
                    </span>
                  ) : isRegistered ? (
                    'Se désinscrire'
                  ) : (
                    'S\'inscrire'
                  )}
                </button>
              ) : (
                <div className="text-center">
                  {event.status !== 'published' && (
                    <p className="text-gray-500 text-sm">Événement non publié</p>
                  )}
                  {event.max_participants && event.current_participants >= event.max_participants && (
                    <p className="text-red-600 text-sm">Événement complet</p>
                  )}
                  {new Date(event.start_date) < new Date() && (
                    <p className="text-gray-500 text-sm">Événement passé</p>
                  )}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="text-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                event.status === 'published' ? 'bg-green-100 text-green-800' :
                event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {event.status === 'published' ? 'Publié' :
                 event.status === 'draft' ? 'Brouillon' :
                 event.status === 'cancelled' ? 'Annulé' :
                 event.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
