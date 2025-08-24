#!/usr/bin/env python3
"""
Script de vérification simple de PostgreSQL
"""

try:
    import psycopg2
    print("✅ psycopg2 est installé")
    
    # Paramètres de connexion
    params = {
        'host': 'localhost',
        'port': '5432',
        'database': 'postgres',  # Base de données par défaut pour tester la connexion
        'user': 'postgres',
        'password': 'admin1234'
    }
    
    print("📡 Tentative de connexion à PostgreSQL...")
    connection = psycopg2.connect(**params)
    print("✅ Connexion réussie à PostgreSQL !")
    
    cursor = connection.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print(f"📊 Version: {version[0]}")
    
    cursor.close()
    connection.close()
    
except ImportError:
    print("❌ psycopg2 n'est pas installé")
    print("   Installez-le avec: pip install psycopg2-binary")
    
except Exception as e:
    print(f"❌ Erreur de connexion: {e}")
    print("\n🔧 Vérifiez que:")
    print("   1. PostgreSQL est installé et démarré")
    print("   2. L'utilisateur 'postgres' existe")
    print("   3. Le mot de passe est correct")
    print("   4. Le service PostgreSQL écoute sur le port 5432")
