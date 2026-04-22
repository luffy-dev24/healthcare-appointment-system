from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView,RetrieveUpdateDestroyAPIView,ListAPIView
from .serializer import *
from .models import AppointmentSlot , Booking
# Create your views here.

#views for AppointmentSlot
class AppointmentsAPI(ListCreateAPIView):
    serializer_class = AppointmentSlotSerializer
    queryset = AppointmentSlot.objects.all()

#views for individual appointment slot
class AppointmentSlotDetailAPI(RetrieveUpdateDestroyAPIView):
    serializer_class = AppointmentSlotSerializer
    queryset = AppointmentSlot.objects.all()

#appointments of particular doctor
class DoctorAppointmentsAPI(ListCreateAPIView):
    serializer_class = DoctorAppointmentsSerializer

    def get_queryset(self):
        user_id = self.kwargs["pk"]
        doctor_profile = DoctorProfile.objects.get(user_id=user_id)
        return AppointmentSlot.objects.filter(doctor=doctor_profile)



#----------------------------------------------
class BookingAPI(ListCreateAPIView):
    serializer_class = BookingSerializer
    queryset         = Booking.objects.all()


class BookingDetailAPI(RetrieveUpdateDestroyAPIView):
    serializer_class = BookingSerializer
    queryset = Booking.objects.all()



class BookingsOfSlotAPI(ListAPIView):
    serializer_class = BookingsOfOneAppointmentSlot

    def get_queryset(self):
        slot_id = self.kwargs['pk']
        return Booking.objects.filter(slot__id=slot_id)
    
class PatientBookingsAPI(ListAPIView):
    serializer_class = PatientBookingsSerializer

    def get_queryset(self):
        user_id = self.kwargs["pk"]
        return Booking.objects.filter(patient__user_id=user_id)