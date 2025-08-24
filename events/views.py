from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.utils import timezone
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from datetime import datetime, timedelta

from .models import Category, Event, EventRegistration, EventImage, EventComment, UserProfile
from .serializers import (
    CategorySerializer, EventSerializer, EventCreateSerializer, EventUpdateSerializer,
    EventRegistrationSerializer, EventRegistrationCreateSerializer, EventRegistrationUpdateSerializer,
    EventImageSerializer, EventImageCreateSerializer,
    EventCommentSerializer, EventCommentCreateSerializer, EventCommentUpdateSerializer,
    UserSerializer, UserRegistrationSerializer, UserProfileSerializer
)

def home_view(request):
    """Vue d'accueil simple pour tester le serveur"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Eventfy - Accueil</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; text-align: center; }
            .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .endpoints { background: #f8f9fa; padding: 20px; border-radius: 5px; }
            .endpoint { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #007bff; }
            .endpoint strong { color: #007bff; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎉 Eventfy - Serveur Django Fonctionnel !</h1>
            
            <div class="status">
                <strong>✅ Statut :</strong> Le serveur Django fonctionne parfaitement !
            </div>
            
            <h2>🚀 Endpoints disponibles :</h2>
            <div class="endpoints">
                <div class="endpoint">
                    <strong>API REST :</strong> <a href="/api/">/api/</a>
                </div>
                <div class="endpoint">
                    <strong>Admin Django :</strong> <a href="/admin/">/admin/</a>
                </div>
                <div class="endpoint">
                    <strong>Catégories :</strong> <a href="/api/categories/">/api/categories/</a>
                </div>
                <div class="endpoint">
                    <strong>Événements :</strong> <a href="/api/events/">/api/events/</a>
                </div>
            </div>
            
            <h2>🔧 Configuration :</h2>
            <ul>
                <li><strong>Base de données :</strong> SQLite (développement)</li>
                <li><strong>PostgreSQL :</strong> Configuré pour la production (base "Eventfly")</li>
                <li><strong>Frontend :</strong> React prêt dans eventfy-frontend/</li>
            </ul>
            
            <h2>📝 Prochaines étapes :</h2>
            <ol>
                <li>Tester l'API avec les endpoints ci-dessus</li>
                <li>Configurer PostgreSQL quand psycopg2 sera compatible Windows</li>
                <li>Développer le frontend React</li>
            </ol>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html_content)

# Authentication Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """Endpoint pour l'inscription d'un nouvel utilisateur"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user_data = UserSerializer(user).data
        return Response({
            'message': 'Utilisateur créé avec succès',
            'user': user_data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """Endpoint pour récupérer le profil de l'utilisateur connecté"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_user_profile(request):
    """Endpoint pour mettre à jour le profil utilisateur"""
    user = request.user
    
    # Mettre à jour les données utilisateur
    user_data = {
        'first_name': request.data.get('first_name', user.first_name),
        'last_name': request.data.get('last_name', user.last_name),
        'email': request.data.get('email', user.email),
    }
    
    user_serializer = UserSerializer(user, data=user_data, partial=True)
    if user_serializer.is_valid():
        user_serializer.save()
    else:
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Mettre à jour le profil
    profile_data = {
        'role': request.data.get('role', user.profile.role),
        'phone': request.data.get('phone', user.profile.phone),
        'bio': request.data.get('bio', user.profile.bio),
    }
    
    if 'avatar' in request.FILES:
        profile_data['avatar'] = request.FILES['avatar']
    
    profile_serializer = UserProfileSerializer(user.profile, data=profile_data, partial=True)
    if profile_serializer.is_valid():
        profile_serializer.save()
        return Response({
            'message': 'Profil mis à jour avec succès',
            'user': UserSerializer(user).data
        })
    else:
        return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_events(request):
    """Endpoint pour récupérer les événements de l'utilisateur selon son rôle"""
    user = request.user
    
    if user.profile.role in ['organizer', 'both']:
        # Événements organisés par l'utilisateur
        organized_events = Event.objects.filter(organizer=user)
        organized_serializer = EventSerializer(organized_events, many=True)
        
        # Statistiques pour les organisateurs
        stats = {
            'total_events': organized_events.count(),
            'published_events': organized_events.filter(status='published').count(),
            'draft_events': organized_events.filter(status='draft').count(),
            'total_registrations': EventRegistration.objects.filter(
                event__organizer=user, 
                status='confirmed'
            ).count()
        }
    else:
        organized_serializer = None
        stats = None
    
    # Événements auxquels l'utilisateur est inscrit
    registrations = EventRegistration.objects.filter(user=user, status='confirmed')
    registered_events = [reg.event for reg in registrations]
    registered_serializer = EventSerializer(registered_events, many=True)
    
    return Response({
        'organized_events': organized_serializer.data if organized_serializer else [],
        'registered_events': registered_serializer.data,
        'stats': stats
    })

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission personnalisée pour permettre aux propriétaires de modifier leurs objets
    """
    def has_object_permission(self, request, view, obj):
        # Lecture autorisée pour tous
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Écriture autorisée seulement pour le propriétaire
        if hasattr(obj, 'organizer'):
            return obj.organizer == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False

class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les catégories d'événements
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]

class EventViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les événements
    """
    queryset = Event.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'city', 'is_free', 'is_featured']
    search_fields = ['title', 'description', 'location', 'city']
    ordering_fields = ['start_date', 'end_date', 'created_at', 'price']
    ordering = ['-start_date']
    
    def get_queryset(self):
        queryset = Event.objects.select_related('category', 'organizer').prefetch_related('images', 'comments')
        
        # Filtrer par statut si spécifié
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filtrer par date si spécifié
        date_filter = self.request.query_params.get('date', None)
        if date_filter:
            try:
                if date_filter == 'today':
                    today = timezone.now().date()
                    queryset = queryset.filter(start_date__date=today)
                elif date_filter == 'week':
                    week_start = timezone.now().date()
                    week_end = week_start + timedelta(days=7)
                    queryset = queryset.filter(start_date__date__range=[week_start, week_end])
                elif date_filter == 'month':
                    month_start = timezone.now().date().replace(day=1)
                    next_month = (month_start + timedelta(days=32)).replace(day=1)
                    month_end = next_month - timedelta(days=1)
                    queryset = queryset.filter(start_date__date__range=[month_start, month_end])
            except:
                pass
        
        # Filtrer par distance si coordonnées fournies
        lat = self.request.query_params.get('lat', None)
        lng = self.request.query_params.get('lng', None)
        radius = self.request.query_params.get('radius', 50)  # km par défaut
        
        if lat and lng:
            # Ici on pourrait implémenter un filtre géographique
            # Pour l'instant, on filtre juste par ville
            pass
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EventCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return EventUpdateSerializer
        return EventSerializer
    
    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """Récupérer un événement spécifique et incrémenter les vues"""
        instance = self.get_object()
        
        # Incrémenter le compteur de vues
        instance.increment_views()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Récupérer les événements mis en avant"""
        featured_events = self.get_queryset().filter(is_featured=True, status='published')
        serializer = self.get_serializer(featured_events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Récupérer les événements à venir"""
        upcoming_events = self.get_queryset().filter(
            start_date__gte=timezone.now(),
            status='published'
        ).order_by('start_date')[:10]
        serializer = self.get_serializer(upcoming_events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """Récupérer les événements à proximité (par ville)"""
        city = request.query_params.get('city', None)
        if city:
            nearby_events = self.get_queryset().filter(
                city__iexact=city,
                status='published'
            ).order_by('start_date')
            serializer = self.get_serializer(nearby_events, many=True)
            return Response(serializer.data)
        return Response({'error': 'Paramètre city requis'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def register(self, request, pk=None):
        """S'inscrire à un événement"""
        event = self.get_object()
        
        # Vérifier si l'utilisateur est déjà inscrit
        existing_registration = EventRegistration.objects.filter(
            event=event, 
            user=request.user,
            status__in=['confirmed', 'pending']
        ).first()
        
        if existing_registration:
            return Response(
                {'error': 'Vous êtes déjà inscrit à cet événement'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier que l'événement n'est pas complet
        if event.is_full:
            return Response(
                {'error': 'Cet événement est complet'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier que l'événement est publié
        if event.status != 'published':
            return Response(
                {'error': 'Cet événement n\'est pas encore publié'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier que l'événement n'est pas passé
        from django.utils import timezone
        if event.start_date <= timezone.now():
            return Response(
                {'error': 'Impossible de s\'inscrire à un événement passé'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer l'inscription
        try:
            registration = EventRegistration.objects.create(
                event=event,
                user=request.user,
                notes=request.data.get('notes', ''),
                status='confirmed'
            )
            
            # Mettre à jour le nombre de participants
            event.current_participants = EventRegistration.objects.filter(
                event=event,
                status='confirmed'
            ).count()
            event.save()
            
            response_serializer = EventRegistrationSerializer(registration)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de l\'inscription: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def unregister(self, request, pk=None):
        """Se désinscrire d'un événement"""
        event = self.get_object()
        
        try:
            registration = EventRegistration.objects.get(
                event=event, 
                user=request.user,
                status='confirmed'
            )
            registration.status = 'cancelled'
            registration.save()
            
            # Mettre à jour le nombre de participants
            event.current_participants = EventRegistration.objects.filter(
                event=event,
                status='confirmed'
            ).count()
            event.save()
            
            return Response({'message': 'Désinscription effectuée'}, status=status.HTTP_200_OK)
        except EventRegistration.DoesNotExist:
            return Response(
                {'error': 'Vous n\'êtes pas inscrit à cet événement'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def participants(self, request, pk=None):
        """Récupérer la liste des participants d'un événement (organisateur seulement)"""
        event = self.get_object()
        
        # Vérifier que l'utilisateur est l'organisateur de l'événement
        if event.organizer != request.user:
            return Response(
                {'error': 'Vous n\'avez pas l\'autorisation de voir les participants de cet événement'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Récupérer les inscriptions confirmées
        registrations = EventRegistration.objects.filter(
            event=event,
            status='confirmed'
        ).select_related('user').order_by('registration_date')
        
        participants_data = []
        for registration in registrations:
            participants_data.append({
                'id': registration.user.id,
                'first_name': registration.user.first_name,
                'last_name': registration.user.last_name,
                'email': registration.user.email,
                'registration_date': registration.registration_date,
                'notes': registration.notes
            })
        
        return Response({
            'event_id': event.id,
            'event_title': event.title,
            'total_participants': len(participants_data),
            'participants': participants_data
        })
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def export_participants(self, request, pk=None):
        """Exporter la liste des participants en CSV (organisateur seulement)"""
        event = self.get_object()
        
        # Vérifier que l'utilisateur est l'organisateur de l'événement
        if event.organizer != request.user:
            return Response(
                {'error': 'Vous n\'avez pas l\'autorisation d\'exporter les participants de cet événement'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        import csv
        from django.http import HttpResponse
        
        # Créer la réponse CSV
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="participants_{event.title}_{event.id}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Prénom', 'Nom', 'Email', 'Date d\'inscription', 'Notes'])
        
        # Récupérer les inscriptions confirmées
        registrations = EventRegistration.objects.filter(
            event=event,
            status='confirmed'
        ).select_related('user').order_by('registration_date')
        
        for registration in registrations:
            writer.writerow([
                registration.user.first_name,
                registration.user.last_name,
                registration.user.email,
                registration.registration_date.strftime('%d/%m/%Y %H:%M'),
                registration.notes or ''
            ])
        
        return response

class EventRegistrationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les inscriptions aux événements
    """
    serializer_class = EventRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return EventRegistration.objects.filter(user=self.request.user)

class UserEventsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour récupérer les événements de l'utilisateur avec statistiques
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_events(self, request):
        """Récupérer les événements de l'utilisateur avec statistiques détaillées"""
        user = request.user
        
        # Événements organisés par l'utilisateur
        organized_events = Event.objects.filter(organizer=user).select_related('category')
        
        # Événements auxquels l'utilisateur est inscrit
        registered_events = Event.objects.filter(
            eventregistration__user=user,
            eventregistration__status='confirmed'
        ).select_related('category')
        
        # Statistiques pour les organisateurs
        stats = {}
        if organized_events.exists():
            from django.db.models import Sum, Count
            
            # Calculer les statistiques
            total_events = organized_events.count()
            published_events = organized_events.filter(status='published').count()
            upcoming_events = organized_events.filter(
                start_date__gte=timezone.now(),
                status='published'
            ).count()
            
            # Total des inscriptions pour tous les événements de l'organisateur
            total_registrations = EventRegistration.objects.filter(
                event__organizer=user,
                status='confirmed'
            ).count()
            
            # Total des vues pour tous les événements
            total_views = organized_events.aggregate(
                total=Sum('views_count')
            )['total'] or 0
            
            stats = {
                'total_events': total_events,
                'published_events': published_events,
                'upcoming_events': upcoming_events,
                'total_registrations': total_registrations,
                'total_views': total_views
            }
        
        # Sérialiser les données
        organized_serializer = EventSerializer(organized_events, many=True)
        registered_serializer = EventSerializer(registered_events, many=True)
        
        return Response({
            'organized_events': organized_serializer.data,
            'registered_events': registered_serializer.data,
            'stats': stats
        })
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EventRegistrationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return EventRegistrationUpdateSerializer
        return EventRegistrationSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EventImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les images d'événements
    """
    queryset = EventImage.objects.all()
    serializer_class = EventImageSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return EventImage.objects.filter(event__organizer=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EventImageCreateSerializer
        return EventImageSerializer
    
    def perform_create(self, serializer):
        event_id = self.request.data.get('event')
        event = Event.objects.get(id=event_id)
        if event.organizer != self.request.user:
            raise permissions.PermissionDenied("Vous ne pouvez ajouter des images qu'à vos propres événements")
        serializer.save()

class EventCommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les commentaires d'événements
    """
    queryset = EventComment.objects.all()
    serializer_class = EventCommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        return EventComment.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EventCommentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return EventCommentUpdateSerializer
        return EventCommentSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
