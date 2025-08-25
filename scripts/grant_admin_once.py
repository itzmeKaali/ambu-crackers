import firebase_admin
from firebase_admin import auth
if not firebase_admin._apps:
    firebase_admin.initialize_app()
email = input('Admin email: ')
u = auth.get_user_by_email(email)
auth.set_custom_user_claims(u.uid, {"admin": True})
print('Admin set for', u.uid)
