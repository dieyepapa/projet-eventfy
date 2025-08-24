from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('participant', 'Participant'),
        ('organizer', 'Organisateur'),
        ('both', 'Les deux'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='participant')
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='profiles/avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default="#007bff")  # Hex color code
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Event(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('published', 'Publié'),
        ('cancelled', 'Annulé'),
        ('completed', 'Terminé'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    short_description = models.CharField(max_length=300, blank=True)
    
    # Date et heure
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    # Localisation
    location = models.CharField(max_length=200)
    address = models.TextField()
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default="France")
    
    # Détails
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    max_participants = models.PositiveIntegerField(null=True, blank=True)
    current_participants = models.PositiveIntegerField(default=0)
    
    # Prix
    is_free = models.BooleanField(default=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Organisateur
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    
    # Statut et métadonnées
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    is_private = models.BooleanField(default=False)  # Pour les événements privés
    
    # Images
    main_image = models.ImageField(upload_to='events/images/', null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['start_date', 'status']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['city', 'status']),
        ]
    
    def __str__(self):
        return self.title
    
    def increment_views(self):
        """Incrémenter le nombre de vues"""
        self.views_count = (self.views_count or 0) + 1
        self.save(update_fields=['views_count'])
    
    def save(self, *args, **kwargs):
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)
    
    @property
    def is_full(self):
        if self.max_participants is None:
            return False
        return self.current_participants >= self.max_participants
    
    @property
    def remaining_spots(self):
        if self.max_participants is None:
            return None
        return max(0, self.max_participants - self.current_participants)

class EventRegistration(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmé'),
        ('waitlist', 'Liste d\'attente'),
        ('cancelled', 'Annulé'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_registrations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    registration_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['event', 'user']
        ordering = ['-registration_date']
    
    def __str__(self):
        return f"{self.user.username} - {self.event.title}"
    
    def save(self, *args, **kwargs):
        if self.status == 'confirmed' and self.pk is None:
            # Nouvelle inscription confirmée
            self.event.current_participants += 1
            self.event.save()
        elif self.status == 'cancelled' and self.pk and self._state.fields_cache.get('status') != 'cancelled':
            # Annulation d'une inscription confirmée
            if self._state.fields_cache.get('status') == 'confirmed':
                self.event.current_participants -= 1
                self.event.save()
        super().save(*args, **kwargs)

class EventImage(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='events/gallery/')
    caption = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'uploaded_at']
    
    def __str__(self):
        return f"{self.event.title} - Image {self.order}"

class EventComment(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_comments')
    content = models.TextField()
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.event.title}"
