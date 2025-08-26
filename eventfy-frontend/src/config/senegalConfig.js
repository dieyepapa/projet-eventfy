// Configuration spécifique au Sénégal pour l'application Eventfy
export const senegalConfig = {
  // Informations sur le pays
  country: {
    name: 'Sénégal',
    code: 'SN',
    currency: {
      name: 'Franc CFA',
      symbol: 'FCFA',
      code: 'XOF'
    },
    language: 'fr-SN'
  },

  // Principales villes du Sénégal
  cities: [
    'Dakar',
    'Thiès',
    'Kaolack',
    'Saint-Louis',
    'Ziguinchor',
    'Diourbel',
    'Tambacounda',
    'Mbour',
    'Rufisque',
    'Kolda',
    'Louga',
    'Fatick',
    'Kédougou',
    'Matam',
    'Sédhiou'
  ],

  // Régions administratives
  regions: [
    'Dakar',
    'Thiès',
    'Saint-Louis',
    'Diourbel',
    'Louga',
    'Tambacounda',
    'Kaolack',
    'Fatick',
    'Kolda',
    'Ziguinchor',
    'Kaffrine',
    'Kédougou',
    'Matam',
    'Sédhiou'
  ],

  // Exemples d'adresses sénégalaises
  addressExamples: [
    'Avenue Léopold Sédar Senghor',
    'Rue de la République',
    'Avenue Cheikh Anta Diop',
    'Boulevard du Général de Gaulle',
    'Rue Félix Faure',
    'Avenue Blaise Diagne',
    'Rue Amadou Assane Ndoye',
    'Avenue Bourguiba'
  ],

  // Lieux emblématiques pour les événements
  venues: [
    'Centre International de Conférences Abdou Diouf (CICAD)',
    'Grand Théâtre National Doudou Ndiaye Rose',
    'Palais des Sports Léopold Sédar Senghor',
    'Centre Culturel Blaise Senghor',
    'Institut Français de Dakar',
    'Musée des Civilisations Noires',
    'Place de l\'Indépendance',
    'Corniche de Dakar'
  ],

  // Catégories d'événements adaptées au contexte sénégalais
  eventCategories: [
    {
      name: 'Culture & Arts',
      description: 'Concerts, expositions, festivals culturels',
      icon: '🎭'
    },
    {
      name: 'Sabar & Danse',
      description: 'Événements de danse traditionnelle et moderne',
      icon: '💃'
    },
    {
      name: 'Conférences & Formations',
      description: 'Séminaires, ateliers, formations professionnelles',
      icon: '📚'
    },
    {
      name: 'Sport & Wellness',
      description: 'Événements sportifs, fitness, bien-être',
      icon: '⚽'
    },
    {
      name: 'Business & Networking',
      description: 'Rencontres d\'affaires, networking professionnel',
      icon: '💼'
    },
    {
      name: 'Gastronomie',
      description: 'Festivals culinaires, dégustation, ceebu jen',
      icon: '🍽️'
    },
    {
      name: 'Technologie',
      description: 'Tech meetups, hackathons, innovation',
      icon: '💻'
    },
    {
      name: 'Communauté',
      description: 'Événements communautaires, solidarité',
      icon: '🤝'
    }
  ],

  // Messages et textes localisés
  messages: {
    welcome: 'Bienvenue sur Eventfy Sénégal',
    currency: 'Prix en FCFA',
    free: 'Gratuit',
    location: 'Lieu au Sénégal',
    cityPlaceholder: 'Dakar, Thiès, Saint-Louis...',
    addressPlaceholder: 'Avenue Léopold Sédar Senghor',
    postalCodePlaceholder: '12500',
    dashboard: {
      organizerWelcome: 'Tableau de bord Organisateur',
      participantWelcome: 'Mon espace participant',
      stats: {
        totalEvents: 'Total événements',
        publishedEvents: 'Événements publiés',
        totalRegistrations: 'Total inscriptions',
        upcomingEvents: 'Événements à venir',
        totalViews: 'Total vues',
        drafts: 'Brouillons'
      }
    }
  },

  // Configuration des prix (gammes typiques au Sénégal)
  pricing: {
    ranges: [
      { label: 'Gratuit', min: 0, max: 0 },
      { label: 'Économique', min: 1000, max: 5000 },
      { label: 'Standard', min: 5000, max: 15000 },
      { label: 'Premium', min: 15000, max: 50000 },
      { label: 'VIP', min: 50000, max: 200000 }
    ]
  },

  // Formats de date et heure locaux
  dateFormat: {
    locale: 'fr-SN',
    options: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  }
};

// Fonction utilitaire pour formater les prix en FCFA
export const formatPrice = (price) => {
  if (!price || price === 0) return 'Gratuit';
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(price).replace('XOF', 'FCFA');
};

// Fonction utilitaire pour formater les dates en français sénégalais
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-SN', senegalConfig.dateFormat.options);
};

export default senegalConfig;
