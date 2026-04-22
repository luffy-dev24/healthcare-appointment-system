from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = (
        ('DOCTOR', 'Doctor'),
        ('PATIENT', 'Patient'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    profile_completed = models.BooleanField(default=False)

    
#doctors profiles
class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    specialization = models.CharField(max_length=100)
    experience = models.IntegerField()
    profile_pic    = models.ImageField(upload_to='images/profile_pics/doctor_pics/', blank=True, null=True)
    is_hospital_completed = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username


#patient profile
class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    age = models.IntegerField()
    profile_pic = models.ImageField(upload_to='images/profile_pics/patient_pics/', blank=True, null=True)
    def __str__(self):
        return self.user.username