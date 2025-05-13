from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView,
    logout_view,
    TagViewSet,
    HabitViewSet,
    HabitCompletionViewSet,
    progress_view,
    home,
)

router = DefaultRouter()
router.register(r"tags", TagViewSet)
router.register(r"habits", HabitViewSet)
router.register(r"completions", HabitCompletionViewSet)

urlpatterns = [
    path("", home, name="home"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", logout_view, name="logout"),
    path("progress/", progress_view, name="progress"),
    path("", include(router.urls)),
]
