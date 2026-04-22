from rest_framework import serializers
from .models import AppointmentSlot , Booking 
from users.models import DoctorProfile, User , PatientProfile
from django.db import transaction
from hospitals.models import Hospital

class DoctorInfoSerializer(serializers.ModelSerializer):
    doctor_name  = serializers.SerializerMethodField()
    doctor_image = serializers.SerializerMethodField()

    class Meta:
        model  = DoctorProfile
        fields = ['id', 'doctor_name', 'doctor_image', 'specialization', 'experience']

    def get_doctor_name(self, obj):
        # getting username from related User model
        return obj.user.username

    def get_doctor_image(self, obj):
        request = self.context.get('request')
        # only return image if doctor has uploaded one
        if obj.profile_pic:
            return request.build_absolute_uri(obj.profile_pic.url)
        return None


class AppointmentSlotSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(write_only=True)
    email   = serializers.EmailField(write_only=True)

    # nested serializer replaces plain doctor id
    doctor  = DoctorInfoSerializer(read_only=True)

    class Meta:
        model  = AppointmentSlot
        fields = [
            'user_id', 'email', 'id', 'doctor',
            'date', 'start_time', 'end_time',
            'total_slots', 'booked_count', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'doctor', 'booked_count', 'status', 'created_at']

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("Start time must be before end time.")

        try:
            doctor_profile = DoctorProfile.objects.get(
                user_id=data['user_id'],
                user__email=data['email']
            )
        except DoctorProfile.DoesNotExist:
            raise serializers.ValidationError("Doctor profile not found.")

        try:
            hospital = Hospital.objects.get(doctor=doctor_profile)
        except Hospital.DoesNotExist:
            raise serializers.ValidationError("Hospital not found for this doctor.")

        if data['start_time'] < hospital.opening_time:
            raise serializers.ValidationError(
                f"Start time cannot be before hospital opening time ({hospital.opening_time})."
            )
        if data['end_time'] > hospital.closing_time:
            raise serializers.ValidationError(
                f"End time cannot be after hospital closing time ({hospital.closing_time})."
            )

        return data

    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        email   = validated_data.pop('email')

        doctor_profile   = DoctorProfile.objects.get(user_id=user_id, user__email=email)
        appointment_slot = AppointmentSlot.objects.create(doctor=doctor_profile, **validated_data)
        return appointment_slot



       # only needed if you reference it directly


class DoctorAppointmentsSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.user.username', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)

    doctor_image = serializers.SerializerMethodField()

    hospital_name = serializers.CharField(source='doctor.hospital.clinic_name', read_only=True)
    hospital_address = serializers.CharField(source='doctor.hospital.address', read_only=True)
    hospital_city = serializers.CharField(source='doctor.hospital.city', read_only=True)
    hospital_phone = serializers.CharField(source='doctor.hospital.phone', read_only=True)

    class Meta:
        model = AppointmentSlot
        fields = [
            'id',
            'doctor_name',
            'doctor_specialization',
            'doctor_image',

            'hospital_name',
            'hospital_address',
            'hospital_city',
            'hospital_phone',

            'date', 'start_time', 'end_time',
            'total_slots', 'booked_count', 'status', 'created_at',
        ]
        read_only_fields = fields  # all are read-only for this serializer

    def get_doctor_image(self, obj):
        request = self.context.get('request')
        if obj.doctor.profile_pic:
            url = obj.doctor.profile_pic.url
            return request.build_absolute_uri(url) if request else url
        return None





class BookingSerializer(serializers.ModelSerializer):

    user_id        = serializers.IntegerField(write_only=True)
    email          = serializers.EmailField(write_only=True)
    appointment_id = serializers.IntegerField(write_only=True)

    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model  = Booking
        fields = [
            "user_id", "email", "appointment_id",
            "patient", "doctor_name", "slot",
            "appointment_date", "appointment_window",
            "token_number", "booked_at"
        ]
        read_only_fields = [
            "patient", "doctor_name", "slot",
            "appointment_date", "appointment_window",
            "token_number", "booked_at"
        ]

    def get_doctor_name(self, obj):
        return obj.doctor.user.username

    def create(self, validated_data):

        user_id        = validated_data.pop('user_id')
        email          = validated_data.pop('email')
        appointment_id = validated_data.pop("appointment_id")

        with transaction.atomic():

            try:
                patient = PatientProfile.objects.get(user__id=user_id, user__email=email)
            except PatientProfile.DoesNotExist:
                raise serializers.ValidationError("Patient profile not found.")

            try:
                # select_for_update locks the row — prevents two patients
                # booking the last slot at the same time
                slot = AppointmentSlot.objects.select_for_update().get(id=appointment_id)
            except AppointmentSlot.DoesNotExist:
                raise serializers.ValidationError("AppointmentSlot not found.")

            if slot.status != 'open':
                raise serializers.ValidationError(f"Slot is {slot.status}. Cannot book.")

            if slot.booked_count >= slot.total_slots:
                raise serializers.ValidationError("Slot is full.")

            already_booked = Booking.objects.filter(patient=patient, slot=slot).exists()
            if already_booked:
                raise serializers.ValidationError("You already booked this slot.")

            booking = Booking.objects.create(
                patient            = patient,
                doctor             = slot.doctor,
                slot               = slot,
                appointment_date   = slot.date,
                appointment_window = f"{slot.start_time.strftime('%H:%M')} - {slot.end_time.strftime('%H:%M')}",
                token_number       = slot.booked_count + 1,
            )

            slot.booked_count += 1
            if slot.booked_count >= slot.total_slots:
                slot.status = 'full'
            slot.save()

            return booking

    
    
    
class BookingsOfOneAppointmentSlot(serializers.ModelSerializer):

    # patient details
    patient_name    = serializers.CharField(source='patient.user.username', read_only=True)
    patient_email   = serializers.CharField(source='patient.user.email',    read_only=True)
    patient_age     = serializers.IntegerField(source='patient.age',        read_only=True)
    patient_pic     = serializers.SerializerMethodField()

    class Meta:
        model  = Booking
        fields = [
            # patient info
            'patient_name',
            'patient_email',
            'patient_age',
            'patient_pic',

            # booking info
            'id',
            'token_number',
            'appointment_date',
            'appointment_window',
            'booked_at',
        ]
        read_only_fields = fields

    def get_patient_pic(self, obj):
        request = self.context.get('request')
        if obj.patient.profile_pic:
            return request.build_absolute_uri(obj.patient.profile_pic.url)
        return None


class PatientBookingsSerializer(serializers.ModelSerializer):

    doctor_name = serializers.CharField(source='doctor.user.username', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)

    doctor_image = serializers.SerializerMethodField()

    hospital_name = serializers.CharField(source='doctor.hospital.clinic_name', read_only=True)
    hospital_address = serializers.CharField(source='doctor.hospital.address', read_only=True)
    hospital_city = serializers.CharField(source='doctor.hospital.city', read_only=True)
    hospital_phone = serializers.CharField(source='doctor.hospital.phone', read_only=True)

    class Meta:
        model  = Booking
        fields = [
            'id',
            'doctor_name',
            'doctor_specialization',
            'doctor_image',

            'hospital_name',
            'hospital_address',
            'hospital_city',
            'hospital_phone',

            'appointment_date', 'appointment_window',
            'token_number', 'booked_at'
        ]
        read_only_fields = fields

    def get_doctor_image(self, obj):
        request = self.context.get('request')
        if obj.doctor.profile_pic:
            url = obj.doctor.profile_pic.url
            return request.build_absolute_uri(url) if request else url
        return None