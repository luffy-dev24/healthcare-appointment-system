from django.urls import path
from .views import *
urlpatterns = [
    path("slots/",AppointmentsAPI.as_view(),name="appointments"),
    path("slots/<int:pk>/",AppointmentSlotDetailAPI.as_view(),name="appointment-detail"),

    path("doctors-appointments/<int:pk>/",DoctorAppointmentsAPI.as_view(),name="doctor-appointments"),
    path("bookings/",BookingAPI.as_view(),name="booking-api"),
    path("bookings/<int:pk>/",BookingDetailAPI.as_view(),name="booking-detail"),

    path('slots/<int:pk>/bookings/', BookingsOfSlotAPI.as_view()),
    path('patient-bookings/<int:pk>/', PatientBookingsAPI.as_view()),
   
]