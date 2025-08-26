import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI, categoriesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { senegalConfig, formatPrice, formatDate } from '../../config/senegalConfig';

const EventCard = ({ event, onDelete }) => {
  const { user } = useAuth();
  
  const formatEventDate = (dateString) => {
    return formatDate(dateString);
  };

  const isOwner = user && event.organizer && user.id === event.organizer.id;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {event.main_image && (
        <img
          src={event.main_image}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {event.category?.name || 'Général'}
          </span>
          {event.is_featured && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              ⭐ Mis en avant
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          <Link to={`/events/${event.id}`} className="hover:text-primary-600">
            {event.title}
          </Link>
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {event.short_description || event.description}
        </p>
        
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatEventDate(event.start_date)}
          </div>
          
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.city}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {event.current_participants} participants
            </div>
            
            <div className="text-right">
              {event.is_free ? (
                <span className="text-green-600 font-medium">{senegalConfig.messages.free}</span>
              ) : (
                <span className="text-gray-900 font-medium">{formatPrice(event.price)}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <Link
            to={`/events/${event.id}`}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium inline-block transition-colors"
          >
            Voir les détails
          </Link>
          
          {isOwner && (
            <div className="flex space-x-2">
              <Link
                to={`/events/${event.id}/edit`}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium inline-block transition-colors"
              >
                Modifier
              </Link>
              <button
                onClick={() => onDelete && onDelete(event.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: '',
    date: '',
  });

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, [filters]);

  useEffect(() => {
    console.log('EventList mounted, fetching data...');
    
    // Check if we need to refresh after event creation
    const state = window.history.state?.usr;
    if (state?.refresh) {
      fetchEvents();
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching events with filters:', filters);
      
      const params = {};
      
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.city) params.city = filters.city;
      if (filters.date) params.date = filters.date;
      
      console.log('API params:', params);
      const response = await eventsAPI.getEvents(params);
      console.log('Events API response:', response);
      
      const eventsData = response.data.results || response.data || [];
      console.log('Events data:', eventsData);
      setEvents(eventsData);
    } catch (err) {
      console.error('Error fetching events:', err);
      console.error('Error response:', err.response);
      setError(`Erreur lors du chargement des événements: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteEvent = async (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${event?.title}" ?`)) {
      try {
        await eventsAPI.deleteEvent(eventId);
        // Refresh the events list
        fetchEvents();
      } catch (err) {
        console.error('Error deleting event:', err);
        alert('Erreur lors de la suppression de l\'événement');
      }
    }
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
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchEvents}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filters */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Filtrer les événements</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <input
              type="text"
              id="search"
              name="search"
              placeholder="Titre, description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Ville
            </label>
            <input
              type="text"
              id="city"
              name="city"
              placeholder={senegalConfig.messages.cityPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={filters.city}
              onChange={handleFilterChange}
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              id="category"
              name="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">Toutes les catégories</option>
              {Array.isArray(categories) && categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Période
            </label>
            <select
              id="date"
              name="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={filters.date}
              onChange={handleFilterChange}
            >
              <option value="">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({ search: '', category: '', city: '', date: '' })}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Événements publics ({events.length})
        </h2>
        {events.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun événement trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              Essayez de modifier vos critères de recherche ou créez le premier événement au Sénégal !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onDelete={handleDeleteEvent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;
