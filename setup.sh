#!/bin/bash

# Create Django project
django-admin startproject core .

# Create apps directory
mkdir apps
cd apps

# Create api app
django-admin startapp api

cd .. 