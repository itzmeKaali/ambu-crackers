import functools
import json
from flask import request, jsonify
import firebase_admin
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

db = firestore.client()


def get_user_from_request():
    hdr = request.headers.get("Authorization", "")
    if not hdr.startswith("Bearer "): 
        return None
    token = hdr.split(" ", 1)[1]
    try:
        decoded = auth.verify_id_token(token)
        uid = decoded["uid"]
        is_admin = bool(decoded.get("admin"))
        if not is_admin:
            doc = db.collection("roles").document(uid).get()
            is_admin = bool(doc.to_dict().get("admin")) if doc.exists else False
        return {"uid": uid, "email": decoded.get("email"), "admin": is_admin}
    except Exception as err:
        print(str(err))
        return None

def require_admin(fn):
    @functools.wraps(fn)
    def _wrap(*a, **kw):
        u = get_user_from_request()
        if not u: 
            return jsonify({"error":"unauthenticated"}), 401
        if not u.get("admin"): 
            return jsonify({"error":"forbidden"}), 403
        return fn(*a, **kw)
    return _wrap
