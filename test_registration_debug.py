#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Eventfy.settings')
django.setup()

from django.contrib.auth.models import User
from events.models import Event, Category, EventRegistration, UserProfile

def test_registration_endpoints():
    """Test registration endpoints step by step"""
    
    print("🔧 Testing registration endpoints...")
    
    # Test server connection
    base_url = 'http://127.0.0.1:8000/api'
    
    try:
        # 1. Test basic API connection
        print("\n1. Testing API connection...")
        response = requests.get(f'{base_url}/events/')
        print(f"   Events endpoint: {response.status_code}")
        
        # 2. Test auth endpoints
        print("\n2. Testing auth endpoints...")
        auth_response = requests.post(f'{base_url}/auth/login/', json={
            'username': 'test',
            'password': 'test'
        })
        print(f"   Auth endpoint: {auth_response.status_code}")
        
        # 3. Create test data if needed
        print("\n3. Creating test data...")
        
        # Create test organizer
        organizer, created = User.objects.get_or_create(
            username='testorg',
            defaults={
                'email': 'org@test.com',
                'first_name': 'Test',
                'last_name': 'Organizer'
            }
        )
        if created:
            organizer.set_password('testpass123')
            organizer.save()
        
        organizer_profile, _ = UserProfile.objects.get_or_create(
            user=organizer,
            defaults={'role': 'organizer'}
        )
        
        # Create test participant
        participant, created = User.objects.get_or_create(
            username='testpart',
            defaults={
                'email': 'part@test.com',
                'first_name': 'Test',
                'last_name': 'Participant'
            }
        )
        if created:
            participant.set_password('testpass123')
            participant.save()
        
        participant_profile, _ = UserProfile.objects.get_or_create(
            user=participant,
            defaults={'role': 'participant'}
        )
        
        # Create test category
        category, _ = Category.objects.get_or_create(
            name='Test Category',
            defaults={'description': 'Test category'}
        )
        
        # Create test event
        from django.utils import timezone
        from datetime import timedelta
        
        event, created = Event.objects.get_or_create(
            title='Test Event Registration',
            defaults={
                'description': 'Test event for registration',
                'short_description': 'Test event',
                'start_date': timezone.now() + timedelta(days=1),
                'end_date': timezone.now() + timedelta(days=1, hours=2),
                'location': 'Test Location',
                'address': '123 Test Street',
                'city': 'Test City',
                'postal_code': '12345',
                'country': 'France',
                'category': category,
                'organizer': organizer,
                'status': 'published',
                'is_free': True,
                'max_participants': 10,
                'current_participants': 0
            }
        )
        
        print(f"   Test event created: {event.title} (ID: {event.id})")
        
        # 4. Test participant login
        print("\n4. Testing participant login...")
        login_response = requests.post(f'{base_url}/auth/login/', json={
            'username': 'testpart',
            'password': 'testpass123'
        })
        
        if login_response.status_code == 200:
            tokens = login_response.json()
            access_token = tokens['access']
            print("   ✅ Login successful")
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            # 5. Test registration endpoint
            print(f"\n5. Testing registration endpoint for event {event.id}...")
            
            # Test the exact URL that frontend uses
            registration_url = f'{base_url}/events/{event.id}/register/'
            print(f"   Registration URL: {registration_url}")
            
            reg_response = requests.post(
                registration_url,
                json={'notes': 'Test registration from script'},
                headers=headers
            )
            
            print(f"   Registration response: {reg_response.status_code}")
            print(f"   Response content: {reg_response.text}")
            
            if reg_response.status_code == 201:
                print("   ✅ Registration successful!")
            else:
                print(f"   ❌ Registration failed: {reg_response.status_code}")
                
            # 6. Test unregistration endpoint
            print(f"\n6. Testing unregistration endpoint...")
            unreg_url = f'{base_url}/events/{event.id}/unregister/'
            print(f"   Unregistration URL: {unreg_url}")
            
            unreg_response = requests.delete(unreg_url, headers=headers)
            print(f"   Unregistration response: {unreg_response.status_code}")
            print(f"   Response content: {unreg_response.text}")
            
        else:
            print(f"   ❌ Login failed: {login_response.status_code}")
            print(f"   Response: {login_response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure Django server is running on port 8000")
        print("   Run: py manage.py runserver")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == '__main__':
    test_registration_endpoints()
