#!/usr/bin/env python3
"""
Script de test pour le serveur Django sur le port 8080
"""

import requests
import time

def test_server_8080():
    """Teste si le serveur Django fonctionne sur le port 8080"""
    
    print("🔍 Test du serveur Django sur le port 8080...")
    print("=" * 50)
    
    # Attendre que le serveur démarre
    print("⏳ Attente du démarrage du serveur...")
    time.sleep(3)
    
    try:
        # Test de la page d'accueil
        print("📡 Test de la page d'accueil sur le port 8080...")
        response = requests.get("http://localhost:8080/", timeout=5)
        print(f"✅ Page d'accueil: {response.status_code}")
        
        if response.status_code == 200:
            print("🎉 Le serveur Django fonctionne sur le port 8080 !")
            print("   Ouvrez votre navigateur sur: http://localhost:8080/")
            print("   Ou testez l'API sur: http://localhost:8080/api/")
        else:
            print("⚠️  Le serveur répond mais avec un code d'erreur")
            
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur sur le port 8080")
        print("   Vérifiez que le serveur est démarré avec:")
        print("   python manage.py runserver 8080")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_server_8080()



