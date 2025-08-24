# Eventfy - Plateforme de Gestion d'Événements

## 🎯 Description

Eventfy est une plateforme complète de gestion d'événements développée avec Django (backend) et React (frontend). Elle permet aux utilisateurs de créer, organiser et participer à des événements de toutes sortes.

## ✨ Fonctionnalités

### 🎪 Gestion des Événements
- **Création et édition** d'événements avec tous les détails
- **Catégorisation** des événements par thème
- **Gestion des dates** et horaires
- **Localisation** complète (adresse, ville, code postal)
- **Gestion des participants** avec limite de places
- **Prix** (gratuit ou payant)
- **Statuts** : brouillon, publié, annulé, terminé
- **Mise en avant** des événements

### 👥 Inscriptions et Participation
- **Inscription** aux événements
- **Gestion des listes d'attente**
- **Suivi des inscriptions** utilisateur
- **Annulation** des inscriptions

### 🖼️ Médias et Contenu
- **Images principales** pour les événements
- **Galerie d'images** avec légendes
- **Gestion des fichiers** média

### 💬 Interactions
- **Commentaires** sur les événements
- **Système de notation** (1-5 étoiles)
- **Modération** des contenus

### 🔍 Recherche et Filtrage
- **Recherche textuelle** dans les titres et descriptions
- **Filtrage par catégorie**, ville, statut
- **Filtrage par date** (aujourd'hui, cette semaine, ce mois)
- **Tri** par date, prix, popularité

## 🏗️ Architecture Technique

### Backend (Django)
- **Framework** : Django 5.2.5
- **API** : Django REST Framework 3.14.0
- **Base de données** : SQLite (développement) / PostgreSQL (production)
- **Authentification** : Système d'utilisateurs Django intégré
- **Permissions** : Système de permissions personnalisées
- **Filtrage** : django-filter pour l'API
- **CORS** : Support cross-origin pour le frontend

### Frontend (React)
- **Framework** : React 19.1.1
- **Build** : Create React App
- **Interface** : Interface moderne et responsive

### Modèles de Données
- **Category** : Catégories d'événements
- **Event** : Événements principaux
- **EventRegistration** : Inscriptions aux événements
- **EventImage** : Images des événements
- **EventComment** : Commentaires et notes

## 🚀 Installation et Configuration

### Prérequis
- Python 3.8+
- Node.js 16+
- pip
- npm ou yarn

### 1. Cloner le projet
```bash
git clone <repository-url>
cd Eventfy
```

### 2. Configuration du Backend

#### Prérequis PostgreSQL
1. **Installer PostgreSQL** sur votre système
2. **Créer la base de données** :
   ```sql
   CREATE DATABASE "Eventfly";
   CREATE USER postgres WITH PASSWORD 'admin1234';
   GRANT ALL PRIVILEGES ON DATABASE "Eventfly" TO postgres;
   ```

#### Configuration Django
```bash
# Créer l'environnement virtuel
python -m venv env

# Activer l'environnement virtuel
# Windows
env\Scripts\activate
# Linux/Mac
source env/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Créer les migrations
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Démarrer le serveur
python manage.py runserver
```

### 3. Configuration du Frontend
```bash
cd eventfy-frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start
```

### 4. Variables d'environnement
Créez un fichier `.env` à la racine du projet basé sur `env.example` :
```env
# Configuration Django
DEBUG=True
SECRET_KEY=your-secret-key-here

# Configuration PostgreSQL
DB_NAME=Eventfly
DB_USER=postgres
DB_PASSWORD=your-password-here
DB_HOST=localhost
DB_PORT=5432

# Configuration CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## 📚 API Endpoints

### Catégories
- `GET /api/categories/` - Liste des catégories
- `GET /api/categories/{id}/` - Détails d'une catégorie

### Événements
- `GET /api/events/` - Liste des événements
- `POST /api/events/` - Créer un événement
- `GET /api/events/{id}/` - Détails d'un événement
- `PUT /api/events/{id}/` - Modifier un événement
- `DELETE /api/events/{id}/` - Supprimer un événement
- `GET /api/events/featured/` - Événements mis en avant
- `GET /api/events/upcoming/` - Événements à venir
- `GET /api/events/nearby/` - Événements à proximité
- `POST /api/events/{id}/register/` - S'inscrire à un événement
- `DELETE /api/events/{id}/unregister/` - Se désinscrire

### Inscriptions
- `GET /api/registrations/` - Mes inscriptions
- `POST /api/registrations/` - Créer une inscription
- `PUT /api/registrations/{id}/` - Modifier une inscription

### Images
- `GET /api/images/` - Mes images d'événements
- `POST /api/images/` - Ajouter une image

### Commentaires
- `GET /api/comments/` - Mes commentaires
- `POST /api/comments/` - Ajouter un commentaire
- `PUT /api/comments/{id}/` - Modifier un commentaire

## 🔧 Configuration de la Base de Données

### SQLite (Configuration actuelle - Développement)
Le projet utilise actuellement SQLite pour le développement :

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### PostgreSQL (Configuration future - Production)
Le projet est préparé pour utiliser PostgreSQL avec la base de données "Eventfly" :

```python
# Dans postgresql_settings.py
POSTGRESQL_DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'Eventfly',
        'USER': 'postgres',
        'PASSWORD': 'admin1234',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Configuration via Variables d'Environnement
Vous pouvez personnaliser la configuration en créant un fichier `.env` :

```env
DB_NAME=Eventfly
DB_USER=postgres
DB_PASSWORD=votre-mot-de-passe
DB_HOST=localhost
DB_PORT=5432
```

### SQLite (Alternative pour le développement)
Si vous préférez utiliser SQLite pour le développement, modifiez `settings.py` :

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

## 🎨 Interface d'Administration

L'interface d'administration Django est accessible à `/admin/` et permet de :
- Gérer les catégories d'événements
- Modérer les événements et commentaires
- Suivre les inscriptions
- Gérer les utilisateurs
- Visualiser les statistiques

## 🧪 Tests

```bash
# Lancer les tests
python manage.py test

# Tests avec couverture
coverage run --source='.' manage.py test
coverage report
```

## 🚀 Déploiement

### Production
1. Configurer les variables d'environnement
2. Utiliser PostgreSQL comme base de données
3. Configurer un serveur web (Nginx/Apache)
4. Utiliser Gunicorn ou uWSGI
5. Configurer les fichiers statiques et média

### Docker (optionnel)
```bash
# Construire l'image
docker build -t eventfy .

# Lancer le conteneur
docker run -p 8000:8000 eventfy
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

## 🔮 Roadmap

- [ ] Système de notifications
- [ ] Intégration de paiements
- [ ] Application mobile
- [ ] Système de badges et récompenses
- [ ] Intégration avec les réseaux sociaux
- [ ] Système de recommandations
- [ ] Analytics et statistiques avancées

---

**Eventfy** - Organisez, découvrez et participez aux meilleurs événements ! 🎉
