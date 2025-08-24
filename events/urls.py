from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'events', views.EventViewSet)
router.register(r'registrations', views.EventRegistrationViewSet, basename='registration')
router.register(r'images', views.EventImageViewSet, basename='image')
router.register(r'comments', views.EventCommentViewSet, basename='comment')

urlpatterns = [
    path('', views.home_view, name='home'),  # Page d'accueil
    
    # Authentication endpoints
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('auth/profile/', views.user_profile, name='user_profile'),
    path('auth/profile/update/', views.update_user_profile, name='update_user_profile'),
    path('auth/my-events/', views.user_events, name='user_events'),
    
    # API endpoints
    path('', include(router.urls)),
]
