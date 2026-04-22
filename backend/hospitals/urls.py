from django.urls import path
from .views import *

urlpatterns = [
    path("posthospital/",HospitalApi.as_view(),name="hospital-api"),
    path("hospital/<int:pk>/",HospitalDetailApi.as_view(),name="hospital-detail"),
    path("hospital-of-doctor/<int:pk>/",HospitalByDoctorAPIView.as_view(),name="hospital-by-doctor"),
    path("hospital-details/<int:pk>/", HospitalDetailAPI.as_view(), name="hospital-detail"),
    path("searchhospitals/", SearchHospitalsByCity.as_view(), name="search-hospitals"),
]