#!/usr/bin/env python3
"""
Script simple pour tester le serveur Django
"""

import requests
import time

def test_server():
    """Teste si le serveur Django fonctionne"""
    
    print("🔍 Test du serveur Django...")
    print("=" * 40)
    
    # Attendre que le serveur démarre
    print("⏳ Attente du démarrage du serveur...")
    time.sleep(3)
    
    try:
        # Test de la page d'accueil
        print("📡 Test de la page d'accueil...")
        response = requests.get("http://localhost:8000/", timeout=5)
        print(f"✅ Page d'accueil: {response.status_code}")
        
        # Test de l'API
        print("📡 Test de l'API...")
        response = requests.get("http://localhost:8000/api/", timeout=5)
        print(f"✅ API: {response.status_code}")
        
        if response.status_code == 200:
            print("🎉 Le serveur Django fonctionne correctement !")
            print("   Vous pouvez maintenant tester l'API complète avec:")
            print("   python test_api.py")
        else:
            print("⚠️  Le serveur répond mais avec un code d'erreur")
            
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur")
        print("   Vérifiez que le serveur est démarré avec:")
        print("   python manage.py runserver")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_server()
