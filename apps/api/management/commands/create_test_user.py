from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Creates a test user if one does not exist"

    def handle(self, *args, **options):
        if not User.objects.filter(username="testuser").exists():
            User.objects.create_user(
                username="testuser", email="test@example.com", password="testpass123"
            )
            self.stdout.write(self.style.SUCCESS("Successfully created test user"))
        else:
            self.stdout.write(self.style.SUCCESS("Test user already exists"))
