from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Event, EventRegistration, EventImage, EventComment

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'color_display', 'event_count']
    list_filter = ['name']
    search_fields = ['name', 'description']
    ordering = ['name']
    
    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 3px;">{}</span>',
            obj.color, obj.color
        )
    color_display.short_description = 'Couleur'
    
    def event_count(self, obj):
        return obj.event_set.count()
    event_count.short_description = 'Nombre d\'événements'

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'organizer', 'category', 'start_date', 'end_date', 
        'city', 'status', 'is_featured', 'participant_count', 'is_full_display'
    ]
    list_filter = [
        'status', 'category', 'city', 'is_free', 'is_featured', 
        'start_date', 'created_at'
    ]
    search_fields = ['title', 'description', 'location', 'city', 'organizer__username']
    list_editable = ['status', 'is_featured']
    date_hierarchy = 'start_date'
    ordering = ['-start_date']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('title', 'description', 'short_description', 'category')
        }),
        ('Date et heure', {
            'fields': ('start_date', 'end_date')
        }),
        ('Localisation', {
            'fields': ('location', 'address', 'city', 'postal_code', 'country')
        }),
        ('Détails', {
            'fields': ('max_participants', 'is_free', 'price', 'organizer')
        }),
        ('Statut', {
            'fields': ('status', 'is_featured')
        }),
        ('Médias', {
            'fields': ('main_image',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'published_at', 'current_participants']
    
    def participant_count(self, obj):
        return f"{obj.current_participants}/{obj.max_participants or '∞'}"
    participant_count.short_description = 'Participants'
    
    def is_full_display(self, obj):
        if obj.is_full:
            return format_html(
                '<span style="color: red; font-weight: bold;">COMPLET</span>'
            )
        return format_html(
            '<span style="color: green;">Disponible</span>'
        )
    is_full_display.short_description = 'Statut'

@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = [
        'event', 'user', 'status', 'registration_date', 'event_date'
    ]
    list_filter = ['status', 'registration_date', 'event__start_date']
    search_fields = ['event__title', 'user__username', 'user__email']
    list_editable = ['status']
    date_hierarchy = 'registration_date'
    ordering = ['-registration_date']
    
    fieldsets = (
        ('Inscription', {
            'fields': ('event', 'user', 'status')
        }),
        ('Détails', {
            'fields': ('notes', 'registration_date')
        }),
    )
    
    readonly_fields = ['registration_date']
    
    def event_date(self, obj):
        return obj.event.start_date
    event_date.short_description = 'Date de l\'événement'

@admin.register(EventImage)
class EventImageAdmin(admin.ModelAdmin):
    list_display = ['event', 'image_preview', 'caption', 'order', 'uploaded_at']
    list_filter = ['event', 'uploaded_at']
    search_fields = ['event__title', 'caption']
    list_editable = ['order', 'caption']
    ordering = ['event', 'order']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 50px;" />',
                obj.image.url
            )
        return "Aucune image"
    image_preview.short_description = 'Aperçu'

@admin.register(EventComment)
class EventCommentAdmin(admin.ModelAdmin):
    list_display = [
        'event', 'user', 'rating', 'content_preview', 'created_at'
    ]
    list_filter = ['rating', 'created_at', 'event']
    search_fields = ['event__title', 'user__username', 'content']
    list_editable = ['rating']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Commentaire', {
            'fields': ('event', 'user', 'content', 'rating')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def content_preview(self, obj):
        return obj.content[:100] + "..." if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Contenu'
