import firebase_admin
import json
# from firebase_admin import auth

from firebase_admin import auth, firestore, credentials
from google.cloud import secretmanager

def get_service_account_from_secret(secret_id: str, version_id: str = "latest"):
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/keen-snow-470010-a7/secrets/service-key/versions/1"
    response = client.access_secret_version(request={"name": name})
    payload = response.payload.data.decode("UTF-8")
    return json.loads(payload)

# Fetch credentials
service_account_info = get_service_account_from_secret("service-key")
cred = credentials.Certificate(service_account_info)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

# if not firebase_admin._apps:
#     firebase_admin.initialize_app()
email = input('Admin email: ')
u = auth.get_user_by_email(email)
auth.set_custom_user_claims(u.uid, {"admin": True})
print('Admin set for', u.uid)

