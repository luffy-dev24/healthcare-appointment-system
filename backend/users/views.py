from typing import List
from urllib import request

from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView , RetrieveUpdateDestroyAPIView , ListAPIView
from .serializer import * 
from rest_framework.views import APIView
from .models import *
from rest_framework.status import *
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework.filters import SearchFilter

from .models import User , DoctorProfile , PatientProfile
from rest_framework_simplejwt.views import TokenObtainPairView



#register user api (used in register component)
class RegisterUserView(ListCreateAPIView):
    serializer_class = RegisterUser
    queryset = User.objects.all()
#-------------------------------------
#get user details
class UserDetailsApi(RetrieveUpdateDestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UserDetailsSerializer
    queryset = User.objects.all()
#--------------------------------------

#login view for getting tokens 
class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer
#--------------------------------------

    

    
#post patient profile
class UpdatePatientProfile(ListCreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = PatientProfileSerializer
    queryset = PatientProfile.objects.all()

class UpdateIndividualPatientProfile(RetrieveUpdateDestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = PatientProfileSerializer
    queryset = PatientProfile.objects.all()

#-------------------------------------------------------
#doctor profile view for post and get used in doctor profile component
class UpdateDoctorProfileApi(ListCreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthenticated]
    serializer_class = DoctorProfilePostSerializer
    queryset = DoctorProfile.objects.all()

#getting single doctor profile 
class SingleDoctorProfileApi(RetrieveUpdateDestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = DoctorProfilePostSerializer
    queryset = DoctorProfile.objects.all()

#-------------------------------------------------------
#doctors List view used in view doctors component
# pagination.py

from rest_framework.pagination import PageNumberPagination

class DoctorPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 50

class DoctorsListApi(ListCreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = DoctorsListSerializer
    queryset = DoctorProfile.objects.all()
    pagination_class = DoctorPagination
#-------------------------------------------------------

#edit profiles api views
class EditProfilePatientAPI(RetrieveUpdateDestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = EditProfilesPatientProfileSerializer
    queryset = PatientProfile.objects.all()

class EditProfileDoctorAPI(RetrieveUpdateDestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = EditProfileDoctorProfileSerializer
    queryset = DoctorProfile.objects.all()

class GetPatientProfileInformation(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self,request,pk):
        user_obj = User.objects.get(id=pk)
        print(user_obj)
        profile = PatientProfile.objects.get(user=user_obj)
        s_obj = GetPatientProfileDetailsSerializer(profile)
        return Response(s_obj.data, status=HTTP_200_OK)
    
class GetDoctorProfileInformation(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self,request,pk):
        user_obj = User.objects.get(id=pk)
        print(user_obj)
        profile = DoctorProfile.objects.get(user=user_obj)
        s_obj = GetDoctorProfileDetailsSerializer(profile)
        return Response(s_obj.data, status=HTTP_200_OK)


#-------------------------------------------------------
class SearchDoctorsBySpecialization(ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = DoctorsListSerializer
    pagination_class = DoctorPagination
    search_fields = ['specialization','user__username','user__email']

    def get_queryset(self):
        doctorslist = DoctorProfile.objects.all()
        search_obj = SearchFilter()
        data = search_obj.filter_queryset(self.request,doctorslist,self)
        return data
