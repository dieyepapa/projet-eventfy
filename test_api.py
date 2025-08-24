#!/usr/bin/env python3
"""
Script de test simple pour vérifier que l'API Eventfy fonctionne
"""

import requests
import json

# URL de base de l'API
BASE_URL = "http://localhost:8000/api"

def test_api():
    """Teste les endpoints principaux de l'API"""
    
    print("🧪 Test de l'API Eventfy")
    print("=" * 50)
    
    try:
        # Test 1: Récupérer les catégories
        print("\n1️⃣ Test des catégories...")
        response = requests.get(f"{BASE_URL}/categories/")
        if response.status_code == 200:
            categories = response.json()
            print(f"✅ {len(categories)} catégories récupérées:")
            for cat in categories[:3]:  # Afficher les 3 premières
                print(f"   - {cat['name']} ({cat['color']})")
        else:
            print(f"❌ Erreur: {response.status_code}")
        
        # Test 2: Récupérer les événements
        print("\n2️⃣ Test des événements...")
        response = requests.get(f"{BASE_URL}/events/")
        if response.status_code == 200:
            events = response.json()
            print(f"✅ {len(events)} événements récupérés:")
            for event in events[:3]:  # Afficher les 3 premiers
                print(f"   - {event['title']} ({event['city']})")
                print(f"     Prix: {'Gratuit' if event['is_free'] else f'€{event['price']}'}")
        else:
            print(f"❌ Erreur: {response.status_code}")
        
        # Test 3: Test des événements mis en avant
        print("\n3️⃣ Test des événements mis en avant...")
        response = requests.get(f"{BASE_URL}/events/featured/")
        if response.status_code == 200:
            featured_events = response.json()
            print(f"✅ {len(featured_events)} événements mis en avant:")
            for event in featured_events:
                print(f"   - {event['title']}")
        else:
            print(f"❌ Erreur: {response.status_code}")
        
        # Test 4: Test des événements à venir
        print("\n4️⃣ Test des événements à venir...")
        response = requests.get(f"{BASE_URL}/events/upcoming/")
        if response.status_code == 200:
            upcoming_events = response.json()
            print(f"✅ {len(upcoming_events)} événements à venir:")
            for event in upcoming_events[:2]:  # Afficher les 2 premiers
                print(f"   - {event['title']} le {event['start_date'][:10]}")
        else:
            print(f"❌ Erreur: {response.status_code}")
        
        # Test 5: Test de recherche
        print("\n5️⃣ Test de recherche...")
        response = requests.get(f"{BASE_URL}/events/?search=musique")
        if response.status_code == 200:
            search_results = response.json()
            print(f"✅ Recherche 'musique': {len(search_results)} résultats")
        else:
            print(f"❌ Erreur: {response.status_code}")
        
        # Test 6: Test de filtrage par ville
        print("\n6️⃣ Test de filtrage par ville...")
        response = requests.get(f"{BASE_URL}/events/?city=Paris")
        if response.status_code == 200:
            paris_events = response.json()
            print(f"✅ Événements à Paris: {len(paris_events)} résultats")
        else:
            print(f"❌ Erreur: {response.status_code}")
        
        print("\n" + "=" * 50)
        print("🎉 Tous les tests sont terminés !")
        print(f"🌐 L'API est accessible à: {BASE_URL}")
        print("📚 Documentation: http://localhost:8000/api/")
        
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter à l'API")
        print("   Assurez-vous que le serveur Django est démarré:")
        print("   python manage.py runserver")
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")

if __name__ == "__main__":
    test_api()
