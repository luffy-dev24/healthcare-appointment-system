from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns =[
    path("register/",RegisterUserView.as_view(),name="register"),
    path("user/<int:pk>/", UserDetailsApi.as_view(), name="user-details"),

    #----patient profile urls
    path("postpatientprofile/", UpdatePatientProfile.as_view(), name="post-patient-profile"),
    path("updatepatientprofile/<int:pk>/", UpdateIndividualPatientProfile.as_view(), name="update-patient-profile"),


    #doctor profile urls
    path("postdoctorprofile/",UpdateDoctorProfileApi.as_view(),name="doctor-profile"),
    path("updatedoctors/<int:pk>/",SingleDoctorProfileApi.as_view(),name="single-doctors"),
    path("getdoctors/", DoctorsListApi.as_view(), name="doctors-list"),


    path("login/", LoginView.as_view(), name="login"),
    path("refresh/",TokenRefreshView.as_view(),name="refresh_token"),

    #----------------------edit profiles
    path("editprofilepatient/<int:pk>/",EditProfilePatientAPI.as_view()),
    path("editprofiledoctor/<int:pk>/",EditProfileDoctorAPI.as_view()),

    #getting patient profile details
    path("getpatientprofile/<int:pk>/",GetPatientProfileInformation.as_view()),
    path("getdoctorprofile/<int:pk>/",GetDoctorProfileInformation.as_view()),

    path("searchdoctors/",SearchDoctorsBySpecialization.as_view(),name="search-doctors"),
     
     
]