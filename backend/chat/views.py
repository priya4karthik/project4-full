import os
import requests
from dotenv import load_dotenv
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ChatMessage
from .serializers import ChatSerializer

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")


# 🔐 REGISTER
@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = User.objects.create_user(username=username, password=password)
    return Response({"message": "User created"})


# 🔐 LOGIN
@api_view(['POST'])
def login(request):
    user = authenticate(
        username=request.data.get('username'),
        password=request.data.get('password')
    )

    if user:
        return Response({"message": "Login success", "user_id": user.id})
    return Response({"error": "Invalid credentials"}, status=400)


# 🤖 CHAT API
@api_view(['POST'])
def chat_api(request):
    user_id = request.data.get('user_id')
    user_message = request.data.get('message')

    try:
        user = User.objects.get(id=user_id)

        res = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openai/gpt-3.5-turbo",
                "messages": [{"role": "user", "content": user_message}]
            }
        )

        data = res.json()
        bot_response = data['choices'][0]['message']['content']

        ChatMessage.objects.create(
            user=user,
            message=user_message,
            response=bot_response
        )

        return Response({"response": bot_response})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# 📜 USER-WISE HISTORY
@api_view(['GET'])
def chat_history(request):
    user_id = request.GET.get('user_id')

    chats = ChatMessage.objects.filter(user_id=user_id).order_by('created_at')
    serializer = ChatSerializer(chats, many=True)

    return Response(serializer.data)


# 🗑️ DELETE CHAT
@api_view(['DELETE'])
def delete_chat(request, id):
    ChatMessage.objects.get(id=id).delete()
    return Response({"message": "Deleted"})