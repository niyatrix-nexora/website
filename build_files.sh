#!/bin/bash
# Vercel build script for Django
pip install -r requirements.txt
python manage.py collectstatic --noinput --clear
