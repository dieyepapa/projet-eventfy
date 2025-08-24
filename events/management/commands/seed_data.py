from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from events.models import Category, Event, EventComment
import random

class Command(BaseCommand):
    help = 'Peuple la base de données avec des exemples d\'événements'

    def handle(self, *args, **options):
        self.stdout.write('Création des données d\'exemple...')
        
        # Créer des utilisateurs de test
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@eventfy.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(f'Utilisateur admin créé: {admin_user.username}')
        
        test_user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@eventfy.com',
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        if created:
            test_user.set_password('test123')
            test_user.save()
            self.stdout.write(f'Utilisateur test créé: {test_user.username}')
        
        # Créer des catégories
        categories_data = [
            {'name': 'Musique', 'description': 'Concerts, festivals et événements musicaux', 'color': '#FF6B6B'},
            {'name': 'Sport', 'description': 'Compétitions sportives et événements fitness', 'color': '#4ECDC4'},
            {'name': 'Technologie', 'description': 'Conférences tech et hackathons', 'color': '#45B7D1'},
            {'name': 'Art & Culture', 'description': 'Expositions, théâtre et événements culturels', 'color': '#96CEB4'},
            {'name': 'Business', 'description': 'Conférences et événements professionnels', 'color': '#FFEAA7'},
            {'name': 'Gastronomie', 'description': 'Festivals culinaires et dégustations', 'color': '#DDA0DD'},
        ]
        
        categories = []
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            categories.append(category)
            if created:
                self.stdout.write(f'Catégorie créée: {category.name}')
        
        # Créer des événements d'exemple
        events_data = [
            {
                'title': 'Festival de Musique Électronique',
                'description': 'Un weekend exceptionnel de musique électronique avec les meilleurs DJs internationaux. Ambiance festive garantie !',
                'short_description': 'Weekend de musique électronique avec DJs internationaux',
                'category': categories[0],  # Musique
                'location': 'Parc des Expositions',
                'address': '123 Avenue des Festivals',
                'city': 'Paris',
                'postal_code': '75001',
                'country': 'France',
                'is_free': False,
                'price': 45.00,
                'max_participants': 1000,
                'is_featured': True,
                'status': 'published'
            },
            {
                'title': 'Marathon de Paris',
                'description': 'Participez au célèbre marathon de Paris et parcourez les plus beaux monuments de la capitale.',
                'short_description': 'Marathon international dans les rues de Paris',
                'category': categories[1],  # Sport
                'location': 'Arc de Triomphe',
                'address': 'Place Charles de Gaulle',
                'city': 'Paris',
                'postal_code': '75008',
                'country': 'France',
                'is_free': False,
                'price': 85.00,
                'max_participants': 50000,
                'is_featured': True,
                'status': 'published'
            },
            {
                'title': 'Conférence Tech 2024',
                'description': 'Découvrez les dernières innovations technologiques avec des experts du secteur.',
                'short_description': 'Conférence sur les innovations technologiques',
                'category': categories[2],  # Technologie
                'location': 'Centre de Congrès',
                'address': '456 Boulevard de l\'Innovation',
                'city': 'Lyon',
                'postal_code': '69001',
                'country': 'France',
                'is_free': True,
                'price': None,
                'max_participants': 500,
                'is_featured': False,
                'status': 'published'
            },
            {
                'title': 'Exposition d\'Art Contemporain',
                'description': 'Découvrez les œuvres d\'artistes contemporains émergents dans cette exposition unique.',
                'short_description': 'Exposition d\'artistes contemporains émergents',
                'category': categories[3],  # Art & Culture
                'location': 'Musée d\'Art Moderne',
                'address': '789 Rue de la Culture',
                'city': 'Marseille',
                'postal_code': '13001',
                'country': 'France',
                'is_free': False,
                'price': 12.00,
                'max_participants': 200,
                'is_featured': False,
                'status': 'published'
            },
            {
                'title': 'Salon de l\'Entrepreneuriat',
                'description': 'Rencontrez des entrepreneurs à succès et découvrez les secrets de la réussite.',
                'short_description': 'Salon dédié à l\'entrepreneuriat et à la réussite',
                'category': categories[4],  # Business
                'location': 'Palais des Congrès',
                'address': '321 Avenue du Business',
                'city': 'Toulouse',
                'postal_code': '31000',
                'country': 'France',
                'is_free': False,
                'price': 25.00,
                'max_participants': 800,
                'is_featured': False,
                'status': 'published'
            },
            {
                'title': 'Festival de Cuisine Française',
                'description': 'Dégustez les meilleurs plats de la gastronomie française avec des chefs renommés.',
                'short_description': 'Festival gastronomique de la cuisine française',
                'category': categories[5],  # Gastronomie
                'location': 'Place du Marché',
                'address': '654 Rue de la Gastronomie',
                'city': 'Bordeaux',
                'postal_code': '33000',
                'country': 'France',
                'is_free': False,
                'price': 35.00,
                'max_participants': 300,
                'is_featured': True,
                'status': 'published'
            }
        ]
        
        # Dates pour les événements (dans le futur)
        base_date = timezone.now() + timedelta(days=30)
        
        for i, event_data in enumerate(events_data):
            # Dates échelonnées sur plusieurs mois
            start_date = base_date + timedelta(days=i * 15)
            end_date = start_date + timedelta(hours=random.randint(2, 8))
            
            event, created = Event.objects.get_or_create(
                title=event_data['title'],
                defaults={
                    **event_data,
                    'start_date': start_date,
                    'end_date': end_date,
                    'organizer': admin_user
                }
            )
            
            if created:
                self.stdout.write(f'Événement créé: {event.title}')
                
                # Créer quelques commentaires d'exemple
                comments_data = [
                    {'content': 'Super événement, j\'ai hâte d\'y participer !', 'rating': 5},
                    {'content': 'Très bien organisé, je recommande !', 'rating': 4},
                    {'content': 'Intéressant, mais pourrait être amélioré.', 'rating': 3},
                ]
                
                for comment_data in comments_data:
                    EventComment.objects.create(
                        event=event,
                        user=test_user,
                        **comment_data
                    )
                
                self.stdout.write(f'  - Commentaires ajoutés pour {event.title}')
        
        self.stdout.write(
            self.style.SUCCESS('Données d\'exemple créées avec succès !')
        )
        self.stdout.write(f'  - {len(categories)} catégories')
        self.stdout.write(f'  - {len(events_data)} événements')
        self.stdout.write(f'  - {len(events_data) * 3} commentaires')
        self.stdout.write('\nVous pouvez maintenant tester l\'API avec ces données !')
