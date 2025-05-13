from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Tag, Habit, HabitCompletion

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name")


class HabitCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitCompletion
        fields = ("id", "habit", "date", "completed")


class HabitSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False
    )
    completions = HabitCompletionSerializer(many=True, read_only=True)

    class Meta:
        model = Habit
        fields = (
            "id",
            "user",
            "name",
            "description",
            "tags",
            "tag_ids",
            "created_at",
            "completions",
        )
        read_only_fields = ("user", "tags", "created_at", "completions")

    def create(self, validated_data):
        tag_ids = validated_data.pop("tag_ids", [])
        habit = Habit.objects.create(**validated_data)
        habit.tags.set(tag_ids)
        return habit

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop("tag_ids", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tag_ids is not None:
            instance.tags.set(tag_ids)
        return instance
