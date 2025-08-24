#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Eventfy.settings')
django.setup()

from events.models import Category

def create_default_categories():
    """Create default categories for events"""
    categories = [
        {
            'name': 'Conférence',
            'description': 'Conférences professionnelles et académiques',
            'color': '#3B82F6'
        },
        {
            'name': 'Formation',
            'description': 'Formations et ateliers éducatifs',
            'color': '#10B981'
        },
        {
            'name': 'Networking',
            'description': 'Événements de réseautage professionnel',
            'color': '#8B5CF6'
        },
        {
            'name': 'Culture',
            'description': 'Événements culturels et artistiques',
            'color': '#F59E0B'
        },
        {
            'name': 'Sport',
            'description': 'Événements sportifs et activités physiques',
            'color': '#EF4444'
        },
        {
            'name': 'Technologie',
            'description': 'Événements tech, innovation et numérique',
            'color': '#06B6D4'
        },
        {
            'name': 'Business',
            'description': 'Événements d\'affaires et entrepreneuriat',
            'color': '#84CC16'
        },
        {
            'name': 'Loisirs',
            'description': 'Événements de divertissement et loisirs',
            'color': '#EC4899'
        }
    ]
    
    created_count = 0
    for cat_data in categories:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'description': cat_data['description'],
                'color': cat_data['color']
            }
        )
        if created:
            created_count += 1
            print(f"✅ Catégorie créée: {category.name}")
        else:
            print(f"⚠️  Catégorie existe déjà: {category.name}")
    
    print(f"\n🎉 {created_count} nouvelles catégories créées!")
    print(f"📊 Total catégories: {Category.objects.count()}")

if __name__ == '__main__':
    create_default_categories()
