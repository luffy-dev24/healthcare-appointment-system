
from rest_framework import serializers
from .models import Hospital, DoctorProfile
from users.models import User


class HospitalSerializer(serializers.ModelSerializer):

    userid  = serializers.IntegerField(write_only=True)
    email   = serializers.EmailField(write_only=True)

    # image_1 and image_2 required — image_3 optional
    image_1 = serializers.ImageField(required=True)
    image_2 = serializers.ImageField(required=True)
    image_3 = serializers.ImageField(required=False)

    class Meta:
        model  = Hospital
        fields = [
            "id",
            "userid", "email",
            "clinic_name", "address", "city", "phone",
            "opening_time", "closing_time",
            "image_1", "image_2", "image_3"
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):

        user = User.objects.get(
            id=validated_data["userid"],
            email=validated_data["email"]
        )

        doctor = DoctorProfile.objects.get(user=user)

        hospital = Hospital.objects.create(
            doctor       = doctor,
            clinic_name  = validated_data["clinic_name"],
            address      = validated_data["address"],
            city         = validated_data["city"],
            phone        = validated_data["phone"],
            opening_time = validated_data["opening_time"],
            closing_time = validated_data["closing_time"],
            image_1      = validated_data["image_1"],
            image_2      = validated_data["image_2"],
            # safe get — None if not uploaded
            image_3      = validated_data.get("image_3", None),
        )

        return hospital

    
class GetHospitalDetailsOfSingleDoctor(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields ="__all__"



# hospitals/serializers.py


class HospitalDetailSerializer(serializers.ModelSerializer):

    # doctor info
    doctor_name           = serializers.CharField(source='doctor.user.username',    read_only=True)
    doctor_email          = serializers.CharField(source='doctor.user.email',       read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization',   read_only=True)
    doctor_experience     = serializers.IntegerField(source='doctor.experience',    read_only=True)
    doctor_pic            = serializers.SerializerMethodField()

    # hospital images with full URL
    image_1               = serializers.SerializerMethodField()
    image_2               = serializers.SerializerMethodField()
    image_3               = serializers.SerializerMethodField()

    class Meta:
        model  = Hospital
        fields = [
            # hospital info
            'id', 'clinic_name', 'address', 'city', 'phone',
            'opening_time', 'closing_time',
            'image_1', 'image_2', 'image_3',

            # doctor info
            'doctor_name', 'doctor_email',
            'doctor_specialization', 'doctor_experience',
            'doctor_pic',
        ]

    def get_doctor_pic(self, obj):
        request = self.context.get('request')
        if obj.doctor.profile_pic:
            return request.build_absolute_uri(obj.doctor.profile_pic.url)
        return None

    def get_image_1(self, obj):
        request = self.context.get('request')
        if obj.image_1:
            return request.build_absolute_uri(obj.image_1.url)
        return None

    def get_image_2(self, obj):
        request = self.context.get('request')
        if obj.image_2:
            return request.build_absolute_uri(obj.image_2.url)
        return None

    def get_image_3(self, obj):
        request = self.context.get('request')
        if obj.image_3:
            return request.build_absolute_uri(obj.image_3.url)
        return None