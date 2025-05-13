from django.contrib import admin
from .models import Tag, Habit, HabitCompletion

# Register your models here.
admin.site.register(Tag)
admin.site.register(Habit)
admin.site.register(HabitCompletion)
