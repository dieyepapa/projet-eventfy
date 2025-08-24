@echo off
echo Installation des dependances et demarrage du serveur Eventfy...
echo.

REM Installation des packages requis
echo Installation de setuptools...
py -m pip install setuptools

echo Installation de Django et des dependances...
py -m pip install Django==5.2.5
py -m pip install djangorestframework==3.14.0
py -m pip install django-cors-headers==4.3.1
py -m pip install django-filter==23.5
py -m pip install Pillow==11.3.0
py -m pip install python-decouple==3.8
py -m pip install requests==2.31.0
py -m pip install djangorestframework-simplejwt==5.3.0

REM Tentative d'installation de psycopg2 (peut echouer sur certains systemes)
echo Installation de psycopg2 (optionnel)...
py -m pip install psycopg2-binary==2.9.10

echo.
echo Creation des migrations...
py manage.py makemigrations

echo Application des migrations...
py manage.py migrate

echo.
echo Demarrage du serveur Django sur http://localhost:8000
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
py manage.py runserver
