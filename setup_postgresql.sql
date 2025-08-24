-- Script de configuration PostgreSQL pour Eventfy
-- Exécutez ce script en tant qu'utilisateur postgres ou superutilisateur

-- Créer la base de données Eventfly
CREATE DATABASE "Eventfly"
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Créer l'utilisateur postgres s'il n'existe pas
-- (Décommentez si nécessaire)
-- CREATE USER postgres WITH PASSWORD 'admin1234';

-- Accorder tous les privilèges sur la base de données
GRANT ALL PRIVILEGES ON DATABASE "Eventfly" TO postgres;

-- Se connecter à la base de données Eventfly
\c "Eventfly";

-- Créer l'extension pour les UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vérifier la création
\l "Eventfly";

-- Afficher les informations de connexion
SELECT 
    'Base de données créée avec succès!' as message,
    'Eventfly' as database_name,
    'postgres' as username,
    'localhost' as host,
    '5432' as port;
