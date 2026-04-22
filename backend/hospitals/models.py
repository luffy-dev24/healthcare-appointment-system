from django.db import models
from users.models import DoctorProfile

# Create your models here.
class Hospital(models.Model):
    
    doctor = models.OneToOneField(
        DoctorProfile,
        on_delete=models.CASCADE
    )

    clinic_name = models.CharField(max_length=200)
    address = models.TextField()
    city = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    # 2 required + 1 optional
    image_1 = models.ImageField(upload_to='images/hospital_pics/', blank=True, null=True)
    image_2 = models.ImageField(upload_to='images/hospital_pics/', blank=True, null=True)
    image_3 = models.ImageField(upload_to='images/hospital_pics/', blank=True, null=True)
