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

def test_registration_api():
    """Test the registration API endpoint"""
    
    # Create test data
    print("🔧 Creating test data...")
    
    # Create a test user (organizer)
    organizer, created = User.objects.get_or_create(
        username='testorganizer',
        defaults={
            'email': 'organizer@test.com',
            'first_name': 'Test',
            'last_name': 'Organizer'
        }
    )
    if created:
        organizer.set_password('testpass123')
        organizer.save()
    
    # Create organizer profile
    organizer_profile, _ = UserProfile.objects.get_or_create(
        user=organizer,
        defaults={'role': 'organizer'}
    )
    
    # Create a test user (participant)
    participant, created = User.objects.get_or_create(
        username='testparticipant',
        defaults={
            'email': 'participant@test.com',
            'first_name': 'Test',
            'last_name': 'Participant'
        }
    )
    if created:
        participant.set_password('testpass123')
        participant.save()
    
    # Create participant profile
    participant_profile, _ = UserProfile.objects.get_or_create(
        user=participant,
        defaults={'role': 'participant'}
    )
    
    # Create a test category
    category, _ = Category.objects.get_or_create(
        name='Test Category',
        defaults={'description': 'Test category for registration'}
    )
    
    # Create a test event
    from django.utils import timezone
    from datetime import timedelta
    
    event, created = Event.objects.get_or_create(
        title='Test Event for Registration',
        defaults={
            'description': 'Test event description',
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
    
    print(f"✅ Test event created: {event.title} (ID: {event.id})")
    print(f"   Status: {event.status}")
    print(f"   Max participants: {event.max_participants}")
    print(f"   Current participants: {event.current_participants}")
    print(f"   Is full: {event.is_full}")
    
    # Test API endpoints
    base_url = 'http://127.0.0.1:8000/api'
    
    # 1. Login as participant
    print("\n🔐 Testing participant login...")
    login_data = {
        'username': 'testparticipant',
        'password': 'testpass123'
    }
    
    try:
        response = requests.post(f'{base_url}/auth/login/', json=login_data)
        print(f"Login response status: {response.status_code}")
        
        if response.status_code == 200:
            tokens = response.json()
            access_token = tokens['access']
            print("✅ Login successful")
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            # 2. Test event registration
            print(f"\n📝 Testing event registration for event {event.id}...")
            registration_data = {
                'notes': 'Test registration'
            }
            
            reg_response = requests.post(
                f'{base_url}/events/{event.id}/register/',
                json=registration_data,
                headers=headers
            )
            
            print(f"Registration response status: {reg_response.status_code}")
            print(f"Registration response: {reg_response.text}")
            
            if reg_response.status_code == 201:
                print("✅ Registration successful!")
                
                # Check if registration was created
                registration = EventRegistration.objects.filter(
                    event=event,
                    user=participant
                ).first()
                
                if registration:
                    print(f"   Registration status: {registration.status}")
                    print(f"   Registration date: {registration.registration_date}")
                else:
                    print("❌ Registration not found in database")
                
                # Check event participant count
                event.refresh_from_db()
                print(f"   Updated participant count: {event.current_participants}")
                
            else:
                print(f"❌ Registration failed: {reg_response.text}")
                
        else:
            print(f"❌ Login failed: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure Django server is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == '__main__':
    test_registration_api()
