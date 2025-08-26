import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, categoriesAPI } from '../../services/api';
import { senegalConfig, formatPrice } from '../../config/senegalConfig';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    start_date: '',
    end_date: '',
    location: '',
    address: '',
    city: '',
    postal_code: '',
    country: senegalConfig.country.name,
    category: '',
    max_participants: '',
    is_free: true,
    price: '',
    status: 'published',
    is_featured: false,
    is_private: false,
    main_image: null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (!formData.start_date) newErrors.start_date = 'La date de début est requise';
    if (!formData.end_date) newErrors.end_date = 'La date de fin est requise';
    if (!formData.location.trim()) newErrors.location = 'Le lieu est requis';
    if (!formData.address.trim()) newErrors.address = 'L\'adresse est requise';
    if (!formData.city.trim()) newErrors.city = 'La ville est requise';

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = 'La date de fin doit être après la date de début';
      }
    }

    if (!formData.is_free && (!formData.price || formData.price <= 0)) {
      newErrors.price = 'Le prix est requis pour un événement payant';
    }

    console.log('Validation completed. Errors found:', newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form data:', formData);
    
    const validationErrors = validateForm();
    console.log('Validation errors:', validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log('Form validation failed, stopping submission');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('Preparing form data for API...');
      
      // Prepare form data for submission
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'main_image' && formData[key]) {
            submitData.append(key, formData[key]);
            console.log(`Added image: ${formData[key].name}`);
          } else if (key !== 'main_image') {
            submitData.append(key, formData[key]);
            console.log(`Added ${key}: ${formData[key]}`);
          }
        }
      });

      console.log('Calling API to create event...');
      const response = await eventsAPI.createEvent(submitData);
      console.log('Event created successfully:', response.data);
      
      // Redirect to events list to see the newly created event
      navigate('/events', { 
        state: { message: 'Événement créé avec succès !', refresh: true }
      });
      
    } catch (err) {
      console.error('Error creating event:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      
      if (err.response?.data) {
        console.error('Backend validation errors:', err.response.data);
        setErrors(err.response.data);
      } else {
        setErrors({ general: 'Erreur lors de la création de l\'événement' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Créer un nouvel événement</h1>
        <p className="text-gray-600">Remplissez les informations de votre événement au Sénégal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Informations générales</h3>
              <p className="mt-1 text-sm text-gray-500">
                Les informations de base de votre événement
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Titre de l'événement *
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Ex: Festival Sabar Dakar 2024"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div className="col-span-6">
                  <label htmlFor="short_description" className="block text-sm font-medium text-gray-700">
                    Description courte
                  </label>
                  <input
                    type="text"
                    name="short_description"
                    id="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    maxLength="300"
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Résumé en une phrase"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description complète *
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Décrivez votre événement en détail..."
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                  <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {Array.isArray(categories) && categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="main_image" className="block text-sm font-medium text-gray-700">
                    Image principale
                  </label>
                  <input
                    type="file"
                    name="main_image"
                    id="main_image"
                    accept="image/*"
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Date et heure</h3>
              <p className="mt-1 text-sm text-gray-500">
                Quand aura lieu votre événement ?
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                    Date et heure de début *
                  </label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    id="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                    Date et heure de fin *
                  </label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    id="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Localisation</h3>
              <p className="mt-1 text-sm text-gray-500">
                Où aura lieu votre événement ?
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Nom du lieu *
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Ex: CICAD, Grand Théâtre, Institut Français..."
                  />
                  {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                </div>

                <div className="col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder={senegalConfig.addressExamples[0]}
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    Ville *
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Dakar"
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                    Code postal
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder={senegalConfig.messages.postalCodePlaceholder}
                  />
                </div>

                <div className="col-span-6 sm:col-span-1">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Pays
                  </label>
                  <input
                    type="text"
                    name="country"
                    id="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing and Capacity */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Prix et capacité</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configuration des tarifs et du nombre de places
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <div className="flex items-center">
                    <input
                      id="is_free"
                      name="is_free"
                      type="checkbox"
                      checked={formData.is_free}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_free" className="ml-2 block text-sm text-gray-900">
                      Événement gratuit
                    </label>
                  </div>
                </div>

                {!formData.is_free && (
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Prix (FCFA) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="5000"
                    />
                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                  </div>
                )}

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700">
                    Nombre maximum de participants
                  </label>
                  <input
                    type="number"
                    name="max_participants"
                    id="max_participants"
                    min="1"
                    value={formData.max_participants}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Laissez vide pour illimité"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Paramètres</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configuration de la visibilité et du statut
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="space-y-6">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Statut
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    id="is_private"
                    name="is_private"
                    type="checkbox"
                    checked={formData.is_private}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_private" className="ml-2 block text-sm text-gray-900">
                    Événement privé (accessible uniquement par invitation)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="is_featured"
                    name="is_featured"
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                    Mettre en avant cet événement
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Création...' : 'Créer l\'événement'}
          </button>
        </div>

        {errors.general && (
          <div className="text-red-600 text-sm text-center">
            {errors.general}
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateEvent;
