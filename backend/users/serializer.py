from rest_framework import serializers
from .models import User , DoctorProfile , PatientProfile
from hospitals.models import Hospital
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer



from rest_framework import serializers
from .models import User


#serializer for user registration
class RegisterUser(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "role", "password"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            role=validated_data["role"],
            password=validated_data["password"]
        )
        return user
    



#serializer for patient profile for update deleteand get 
class UserDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


#serializer for doctors list view used in (view doctors component)
class HospitalInfoSerializer(serializers.ModelSerializer):
    image_1 = serializers.SerializerMethodField()
    image_2 = serializers.SerializerMethodField()
    image_3 = serializers.SerializerMethodField()

    class Meta:
        model  = Hospital
        fields = [
            'id', 'clinic_name', 'address', 'city', 'phone',
            'opening_time', 'closing_time',
            'image_1', 'image_2', 'image_3'
        ]

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


class DoctorsListSerializer(serializers.ModelSerializer):
    user        = UserDetailsSerializer(read_only=True)
    hospital    = serializers.SerializerMethodField()
    profile_pic = serializers.SerializerMethodField()

    class Meta:
        model  = DoctorProfile
        fields = [
            'id', 'user',
            'specialization', 'experience',
            'profile_pic',
            'hospital'
        ]

    def get_profile_pic(self, obj):
        request = self.context.get('request')
        if obj.profile_pic:
            return request.build_absolute_uri(obj.profile_pic.url)
        return None

    def get_hospital(self, obj):
        # hospital may not exist for some doctors
        try:
            hospital = Hospital.objects.get(doctor=obj)
            return HospitalInfoSerializer(hospital, context=self.context).data
        except Hospital.DoesNotExist:
            return None


#serializer for updating doctor profile (get and post) used in doctor profile component
class DoctorProfilePostSerializer(serializers.ModelSerializer):

    userid      = serializers.IntegerField(write_only=True)
    email       = serializers.EmailField(write_only=True)
    profile_pic = serializers.ImageField(required=False)  # optional

    class Meta:
        model  = DoctorProfile
        fields = ["id","userid", "email", "specialization", "experience", "profile_pic", "is_hospital_completed"]
        read_only_fields = ["id","is_hospital_completed"]

    def create(self, validated_data):

        userDetails = User.objects.get(
            id=validated_data["userid"],
            email=validated_data["email"]
        )

        # get profile_pic if user uploaded one
        profile_pic = validated_data.get("profile_pic", None)

        profile = DoctorProfile.objects.create(
            user           = userDetails,
            specialization = validated_data["specialization"],
            experience     = validated_data["experience"],
            profile_pic    = profile_pic,  # None if not uploaded
        )

        # update user profile status
        userDetails.profile_completed = True
        userDetails.save()

        return profile



#serializer for patient profile (post and get) used in patient profile component
class PatientProfileSerializer(serializers.ModelSerializer):

    userid      = serializers.IntegerField(write_only=True)
    email       = serializers.EmailField(write_only=True)
    profile_pic = serializers.ImageField(required=False)  # optional

    class Meta:
        model  = PatientProfile
        fields = ["id", "userid", "email", "age", "profile_pic"]
        read_only_fields = ["id"]
        

    def create(self, validated_data):

        userDetails = User.objects.get(
            id=validated_data["userid"],
            email=validated_data["email"]
        )

        # get profile_pic safely — None if not uploaded
        profile_pic = validated_data.get("profile_pic", None)

        profile = PatientProfile.objects.create(
            user        = userDetails,
            age         = validated_data["age"],
            profile_pic = profile_pic,
        )

        # update user profile status
        userDetails.profile_completed = True
        userDetails.save()

        return profile
    







#login serializer and adding extra fields in token
class CustomTokenSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['profile_completed'] = user.profile_completed

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data['userID'] = self.user.id
        data['username'] = self.user.username
        data['email'] = self.user.email
        data['role'] = self.user.role
        data['profile_completed'] = self.user.profile_completed

        return data


#serilaiser for editing profiles

class EditProfilesPatientProfileSerializer(serializers.ModelSerializer):
    user = UserDetailsSerializer(read_only=True)
    class Meta:
        model = PatientProfile
        fields = ["id","user","age","profile_pic"]


class EditProfileDoctorProfileSerializer(serializers.ModelSerializer):
    user = UserDetailsSerializer(read_only=True)
    class Meta:
        model = DoctorProfile
        fields = ["id","user","specialization", "experience", "profile_pic"]


class GetPatientProfileDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = "__all__"

class GetDoctorProfileDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = "__all__"