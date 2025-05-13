from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, viewsets, status
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count
from datetime import date, timedelta
from .models import Tag, Habit, HabitCompletion
from .serializers import (
    UserSerializer,
    TagSerializer,
    HabitSerializer,
    HabitCompletionSerializer,
)

User = get_user_model()

# Create your views here.


@swagger_auto_schema(
    method="get",
    operation_description="Get a welcome message",
    responses={
        200: openapi.Response(
            description="Successful response",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "message": openapi.Schema(type=openapi.TYPE_STRING),
                    "status": openapi.Schema(type=openapi.TYPE_STRING),
                },
            ),
        )
    },
)
@api_view(["GET"])
def home(request):
    """
    A simple API endpoint that returns a welcome message.
    """
    return Response(
        {"message": "Welcome to the Smart Habit Tracker API!", "status": "success"}
    )


# Auth Views
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response(status=status.HTTP_400_BAD_REQUEST)


# Tag ViewSet
class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]


# Habit ViewSet
class HabitViewSet(viewsets.ModelViewSet):
    queryset = Habit.objects.none()
    serializer_class = HabitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Habit.objects.none()
        queryset = Habit.objects.filter(user=self.request.user)
        tag = self.request.query_params.get("tag")
        if tag:
            queryset = queryset.filter(tags__name=tag)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        habit = self.get_object()
        today = date.today()
        completion, created = HabitCompletion.objects.get_or_create(
            habit=habit, date=today
        )
        completion.completed = True
        completion.save()
        return Response({"status": "completed"})

    @action(detail=True, methods=["get"])
    def streak(self, request, pk=None):
        habit = self.get_object()
        completions = habit.completions.filter(completed=True).order_by("-date")
        streak = 0
        today = date.today()
        for i, c in enumerate(completions):
            if c.date == today - timedelta(days=i):
                streak += 1
            else:
                break
        return Response({"streak": streak})


# HabitCompletion ViewSet
class HabitCompletionViewSet(viewsets.ModelViewSet):
    queryset = HabitCompletion.objects.none()
    serializer_class = HabitCompletionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return HabitCompletion.objects.none()
        return HabitCompletion.objects.filter(habit__user=self.request.user)


# Progress API
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def progress_view(request):
    habits = Habit.objects.filter(user=request.user)
    data = []
    for habit in habits:
        total = habit.completions.count()
        completed = habit.completions.filter(completed=True).count()
        data.append(
            {
                "habit": habit.name,
                "total": total,
                "completed": completed,
            }
        )
    return Response(data)
