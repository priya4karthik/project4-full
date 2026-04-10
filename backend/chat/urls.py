from django.urls import path
from .views import register, login, chat_api, chat_history, delete_chat

urlpatterns = [
    path('register/', register),
    path('login/', login),
    path('chat/', chat_api),
    path('history/', chat_history),
    path('delete/<int:id>/', delete_chat),
]