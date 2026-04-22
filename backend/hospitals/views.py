from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView ,\
      RetrieveUpdateDestroyAPIView,RetrieveAPIView , ListAPIView 
from .serializer import *
from .models import Hospital
from rest_framework.filters import SearchFilter

# Create your views here.
from rest_framework.pagination import PageNumberPagination

class HospitalPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 50

class HospitalApi(ListCreateAPIView):
    serializer_class = HospitalSerializer
    queryset = Hospital.objects.all()
    pagination_class = HospitalPagination

class HospitalDetailApi(RetrieveUpdateDestroyAPIView):
    serializer_class = HospitalSerializer
    queryset = Hospital.objects.all()

class HospitalByDoctorAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = GetHospitalDetailsOfSingleDoctor

    def get_queryset(self):
        user_id = self.kwargs["pk"]
        doctor_profile = DoctorProfile.objects.get(user_id=user_id)
        return Hospital.objects.filter(doctor=doctor_profile)


class HospitalDetailAPI(RetrieveAPIView):
    serializer_class = HospitalDetailSerializer
    queryset         = Hospital.objects.all()

#-----------------hospital serach view
class SearchHospitalsByCity(ListAPIView):
    serializer_class = HospitalSerializer
    pagination_class = HospitalPagination
    search_fields = ['city','clinic_name']

    def get_queryset(self):
        hospitals = Hospital.objects.all()
        search_obj = SearchFilter()
        data = search_obj.filter_queryset(self.request,hospitals,self)
        return data