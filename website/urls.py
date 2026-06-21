from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("blog/", views.blog, name="blog"),
    path("careers/", views.careers, name="careers"),
    path("contact/", views.contact, name="contact"),
    path("apply/", views.apply_job, name="apply"),
]
