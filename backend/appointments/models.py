from django.db import models

# Create your models here.
from django.db import models
from users.models import DoctorProfile
from users.models import PatientProfile
  # import your existing profile model



class AppointmentSlot(models.Model):
    STATUS_CHOICES = [
        ('open',   'Open'),
        ('closed', 'Closed'),
        ('full','Full')
    ]

    doctor       = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='slots')
    date         = models.DateField()
    start_time   = models.TimeField()
    end_time     = models.TimeField()
    total_slots  = models.PositiveIntegerField()
    booked_count = models.PositiveIntegerField(default=0)
    status       = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open',)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"Dr.{self.doctor.user.username} | {self.date} | {self.start_time}-{self.end_time}"

    def remaining_slots(self):
        return self.total_slots - self.booked_count
    
    
    
#models for booking appointment
class Booking(models.Model):
    patient          = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='bookings')
    doctor           = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='doctor_bookings')
    slot             = models.ForeignKey(AppointmentSlot, on_delete=models.CASCADE, related_name='bookings')
    appointment_date = models.DateField()
    appointment_window = models.CharField(max_length=20)  # "10:00 - 14:00"
    token_number     = models.PositiveIntegerField()
    booked_at        = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[('confirmed', 'Confirmed'), ('cancelled', 'Cancelled')],
        default='confirmed'   # ← Add this
    )

    class Meta:
        ordering = ['appointment_date', 'token_number']
        unique_together = ['patient', 'slot']  # patient can't book same slot twice

    def __str__(self):
        return f"Token {self.token_number} | {self.patient.user.username} with Dr.{self.doctor.user.username} on {self.appointment_date} at {self.appointment_window}"