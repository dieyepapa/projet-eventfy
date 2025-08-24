#!/usr/bin/env python
"""
Script de test pour les endpoints d'authentification Eventfy
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_authentication_endpoints():
    """Test des endpoints d'authentification"""
    
    print("🧪 Test des endpoints d'authentification Eventfy")
    print("=" * 50)
    
    # Test 1: Inscription d'un nouvel utilisateur
    print("\n1. Test d'inscription utilisateur")
    register_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
        "password_confirm": "testpassword123",
        "first_name": "Test",
        "last_name": "User",
        "role": "organizer"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register/", json=register_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            print("✅ Inscription réussie")
            print(f"Réponse: {response.json()}")
        else:
            print("❌ Erreur lors de l'inscription")
            print(f"Erreur: {response.json()}")
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur Django")
        print("Assurez-vous que le serveur Django est démarré avec: python manage.py runserver")
        return
    
    # Test 2: Connexion utilisateur
    print("\n2. Test de connexion utilisateur")
    login_data = {
        "username": "testuser",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Connexion réussie")
            tokens = response.json()
            access_token = tokens.get('access')
            print(f"Token d'accès reçu: {access_token[:50]}...")
            
            # Test 3: Récupération du profil utilisateur
            print("\n3. Test de récupération du profil")
            headers = {"Authorization": f"Bearer {access_token}"}
            profile_response = requests.get(f"{BASE_URL}/auth/profile/", headers=headers)
            print(f"Status: {profile_response.status_code}")
            if profile_response.status_code == 200:
                print("✅ Profil récupéré avec succès")
                print(f"Profil: {profile_response.json()}")
            else:
                print("❌ Erreur lors de la récupération du profil")
                print(f"Erreur: {profile_response.json()}")
                
            # Test 4: Mise à jour du profil
            print("\n4. Test de mise à jour du profil")
            update_data = {
                "first_name": "Test Updated",
                "bio": "Ceci est une bio de test",
                "phone": "+33123456789"
            }
            update_response = requests.put(f"{BASE_URL}/auth/profile/update/", 
                                         json=update_data, headers=headers)
            print(f"Status: {update_response.status_code}")
            if update_response.status_code == 200:
                print("✅ Profil mis à jour avec succès")
                print(f"Réponse: {update_response.json()}")
            else:
                print("❌ Erreur lors de la mise à jour du profil")
                print(f"Erreur: {update_response.json()}")
                
            # Test 5: Récupération des événements utilisateur
            print("\n5. Test de récupération des événements utilisateur")
            events_response = requests.get(f"{BASE_URL}/auth/my-events/", headers=headers)
            print(f"Status: {events_response.status_code}")
            if events_response.status_code == 200:
                print("✅ Événements récupérés avec succès")
                events_data = events_response.json()
                print(f"Événements organisés: {len(events_data.get('organized_events', []))}")
                print(f"Événements inscrits: {len(events_data.get('registered_events', []))}")
                if events_data.get('stats'):
                    print(f"Statistiques: {events_data['stats']}")
            else:
                print("❌ Erreur lors de la récupération des événements")
                print(f"Erreur: {events_response.json()}")
                
        else:
            print("❌ Erreur lors de la connexion")
            print(f"Erreur: {response.json()}")
    except Exception as e:
        print(f"❌ Erreur: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Tests terminés")

if __name__ == "__main__":
    test_authentication_endpoints()
