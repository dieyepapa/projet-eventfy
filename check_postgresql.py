#!/usr/bin/env python3
"""
Script de vérification de la connexion PostgreSQL pour Eventfy
"""

import psycopg2
from psycopg2 import OperationalError
import sys

def check_postgresql_connection():
    """Vérifie la connexion à PostgreSQL"""
    
    # Paramètres de connexion
    connection_params = {
        'host': 'localhost',
        'port': '5432',
        'database': 'Eventfly',
        'user': 'postgres',
        'password': 'admin1234'
    }
    
    print("🔍 Vérification de la connexion PostgreSQL...")
    print("=" * 50)
    
    try:
        # Tenter la connexion
        print("📡 Tentative de connexion à PostgreSQL...")
        connection = psycopg2.connect(**connection_params)
        
        # Vérifier la version
        cursor = connection.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        
        print("✅ Connexion réussie !")
        print(f"📊 Version PostgreSQL: {version[0]}")
        
        # Vérifier la base de données
        cursor.execute("SELECT current_database();")
        current_db = cursor.fetchone()
        print(f"🗄️  Base de données actuelle: {current_db[0]}")
        
        # Vérifier les tables (si elles existent)
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        if tables:
            print(f"📋 Tables trouvées: {len(tables)}")
            for table in tables:
                print(f"   - {table[0]}")
        else:
            print("📋 Aucune table trouvée (normal si les migrations n'ont pas été appliquées)")
        
        # Fermer la connexion
        cursor.close()
        connection.close()
        
        print("\n🎉 PostgreSQL est correctement configuré !")
        print("   Vous pouvez maintenant lancer Django avec:")
        print("   python manage.py runserver")
        
        return True
        
    except OperationalError as e:
        print("❌ Erreur de connexion PostgreSQL:")
        print(f"   {e}")
        print("\n🔧 Solutions possibles:")
        print("   1. Vérifiez que PostgreSQL est démarré")
        print("   2. Vérifiez que la base de données 'Eventfly' existe")
        print("   3. Vérifiez les paramètres de connexion")
        print("   4. Exécutez le script setup_postgresql.sql")
        return False
        
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        return False

def create_database_if_not_exists():
    """Crée la base de données si elle n'existe pas"""
    
    # Se connecter à postgres (base de données par défaut)
    connection_params = {
        'host': 'localhost',
        'port': '5432',
        'database': 'postgres',
        'user': 'postgres',
        'password': 'admin1234'
    }
    
    try:
        connection = psycopg2.connect(**connection_params)
        cursor = connection.cursor()
        
        # Vérifier si la base de données existe
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'Eventfly';")
        exists = cursor.fetchone()
        
        if not exists:
            print("🗄️  Création de la base de données 'Eventfly'...")
            cursor.execute('CREATE DATABASE "Eventfly";')
            print("✅ Base de données 'Eventfly' créée avec succès !")
        else:
            print("✅ Base de données 'Eventfly' existe déjà")
        
        cursor.close()
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la création de la base de données: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Vérification PostgreSQL pour Eventfy")
    print("=" * 50)
    
    # D'abord, essayer de créer la base de données si elle n'existe pas
    if create_database_if_not_exists():
        # Ensuite, vérifier la connexion
        check_postgresql_connection()
    else:
        print("❌ Impossible de créer la base de données")
        sys.exit(1)
