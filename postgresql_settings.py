"""
Configuration PostgreSQL pour Eventfy
Ce fichier contient la configuration PostgreSQL qui peut être utilisée
quand psycopg2 sera correctement installé sur Windows.
"""

from decouple import config

# Configuration PostgreSQL pour Eventfly
POSTGRESQL_DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='Eventfly'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='admin1234'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
        'OPTIONS': {
            'charset': 'utf8',
        },
    }
}

# Instructions d'utilisation :
# 1. Installer psycopg2 : pip install psycopg2-binary
# 2. Créer la base de données Eventfly dans PostgreSQL
# 3. Dans settings.py, remplacer DATABASES par :
#    from .postgresql_settings import POSTGRESQL_DATABASES
#    DATABASES = POSTGRESQL_DATABASES
