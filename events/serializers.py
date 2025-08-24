from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Event, EventRegistration, EventImage, EventComment, UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role', 'phone', 'bio', 'avatar', 'created_at']
        read_only_fields = ['created_at']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'profile']
        read_only_fields = ['id']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False, default='participant')
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm', 'role']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        role = validated_data.pop('role', 'participant')
        user = User.objects.create_user(**validated_data)
        user.profile.role = role
        user.profile.save()
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class EventImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventImage
        fields = ['id', 'image', 'caption', 'order', 'uploaded_at']

class EventCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = EventComment
        fields = ['id', 'user', 'content', 'rating', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class EventSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    organizer = UserSerializer(read_only=True)
    images = EventImageSerializer(many=True, read_only=True)
    comments = EventCommentSerializer(many=True, read_only=True)
    is_full = serializers.ReadOnlyField()
    remaining_spots = serializers.ReadOnlyField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'short_description',
            'start_date', 'end_date', 'location', 'address', 'city',
            'postal_code', 'country', 'category', 'max_participants',
            'current_participants', 'is_free', 'price', 'organizer',
            'status', 'is_featured', 'is_private', 'main_image', 'created_at',
            'updated_at', 'published_at', 'images', 'comments',
            'is_full', 'remaining_spots'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'published_at', 'current_participants']

class EventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'title', 'description', 'short_description',
            'start_date', 'end_date', 'location', 'address', 'city',
            'postal_code', 'country', 'category', 'max_participants',
            'is_free', 'price', 'status', 'is_featured', 'is_private', 'main_image'
        ]
    
    def validate(self, data):
        # Vérifier que la date de fin est après la date de début
        if data['end_date'] <= data['start_date']:
            raise serializers.ValidationError("La date de fin doit être après la date de début.")
        
        # Vérifier que la date de début est dans le futur (avec une marge de 5 minutes)
        from django.utils import timezone
        from datetime import timedelta
        if data['start_date'] <= timezone.now() - timedelta(minutes=5):
            raise serializers.ValidationError("La date de début doit être dans le futur.")
        
        return data

class EventUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'title', 'description', 'short_description',
            'start_date', 'end_date', 'location', 'address', 'city',
            'postal_code', 'country', 'category', 'max_participants',
            'is_free', 'price', 'status', 'is_featured', 'is_private', 'main_image'
        ]
    
    def validate(self, data):
        # Vérifier que la date de fin est après la date de début
        if 'end_date' in data and 'start_date' in data:
            if data['end_date'] <= data['start_date']:
                raise serializers.ValidationError("La date de fin doit être après la date de début.")
        elif 'end_date' in data:
            if data['end_date'] <= self.instance.start_date:
                raise serializers.ValidationError("La date de fin doit être après la date de début.")
        elif 'start_date' in data:
            if self.instance.end_date <= data['start_date']:
                raise serializers.ValidationError("La date de fin doit être après la date de début.")
        
        return data

class EventRegistrationSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = EventRegistration
        fields = ['id', 'event', 'user', 'status', 'registration_date', 'notes']
        read_only_fields = ['id', 'registration_date']

class EventRegistrationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistration
        fields = ['event', 'notes']
    
    def validate(self, data):
        event = data['event']
        
        # Vérifier que l'utilisateur n'est pas déjà inscrit
        user = self.context['request'].user
        if EventRegistration.objects.filter(event=event, user=user).exists():
            raise serializers.ValidationError("Vous êtes déjà inscrit à cet événement.")
        
        # Vérifier que l'événement n'est pas complet
        if event.is_full:
            raise serializers.ValidationError("Cet événement est complet.")
        
        # Vérifier que l'événement est publié
        if event.status != 'published':
            raise serializers.ValidationError("Cet événement n'est pas encore publié.")
        
        return data

class EventRegistrationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistration
        fields = ['status', 'notes']
    
    def validate_status(self, value):
        # Empêcher de changer le statut si c'est annulé
        if self.instance.status == 'cancelled' and value != 'cancelled':
            raise serializers.ValidationError("Une inscription annulée ne peut pas être modifiée.")
        return value

class EventImageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventImage
        fields = ['image', 'caption', 'order']

class EventCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventComment
        fields = ['content', 'rating']
    
    def validate_rating(self, value):
        if value is not None and (value < 1 or value > 5):
            raise serializers.ValidationError("La note doit être entre 1 et 5.")
        return value

class EventCommentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventComment
        fields = ['content', 'rating']
    
    def validate_rating(self, value):
        if value is not None and (value < 1 or value > 5):
            raise serializers.ValidationError("La note doit être entre 1 et 5.")
        return value
