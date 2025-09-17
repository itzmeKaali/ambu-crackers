from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import firestore, storage
from datetime import datetime
import uuid, json
from authz import require_admin, get_user_from_request
from pdf_utils import render_order_pdf
from email_utils import send_order_pdf_to_admin
from config import ORDERS_BUCKET, PRODUCTS_BUCKET, PRICE_LIST_BLOB, FRONTEND_ORIGIN

app = Flask(__name__)
CORS(app, origins=[FRONTEND_ORIGIN, 'http://localhost:5173'], supports_credentials=True)

db = firestore.Client()
storage_client = storage.Client()
orders_bucket = storage_client.bucket(ORDERS_BUCKET)
products_bucket = storage_client.bucket(PRODUCTS_BUCKET)

# -------- Public --------
@app.get("/api/products")
def list_products():
    cat = request.args.get('category')
    q = db.collection("products").where("is_active","==",True)
    if cat: q = q.where("category","==",cat)
    docs = q.order_by("created_at", direction=firestore.Query.DESCENDING).stream()
    out = []
    for d in docs:
        x = d.to_dict(); x["id"] = d.id; out.append(x)
    return jsonify(out)

@app.get("/api/price-list-url")
def price_list_url():
    blob = products_bucket.blob(PRICE_LIST_BLOB)
    url = blob.generate_signed_url(version='v4', expiration=3600, method='GET')
    return jsonify({"url": url})

@app.post("/api/orders/quick-checkout")
def quick_checkout():
    data = request.json or {}
    order_id = str(uuid.uuid4())
    data['order_id'] = order_id
    data['created_at'] = datetime.utcnow().isoformat()

    orders_bucket.blob(f"orders/{order_id}.json").upload_from_string(json.dumps(data), content_type='application/json')

    pdf = render_order_pdf(data)
    emailed = send_order_pdf_to_admin(data, pdf)
    return jsonify({"order_id": order_id, "emailed": bool(emailed)})

@app.post("/api/enquiry")
def enquiry():
    payload = request.json or {}
    payload['id'] = str(uuid.uuid4())
    payload['created_at'] = datetime.utcnow().isoformat()
    orders_bucket.blob(f"enquiries/{payload['id']}.json").upload_from_string(json.dumps(payload), content_type='application/json')
    return jsonify({"ok": True})

@app.get("/api/me")
@require_admin
def me():
    print('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
    u = get_user_from_request()
    return jsonify(u or {}), (200 if u else 401)

# -------- Admin --------
@app.post("/api/admin/products")
@require_admin
def create_product():
    doc = request.json or {}
    doc['created_at'] = firestore.SERVER_TIMESTAMP
    ref = db.collection('products').add(doc)[1]

    snap = ref.get()  # fetch saved doc with server timestamp resolved
    return jsonify({"id": ref.id, **snap.to_dict()})


@app.put("/api/admin/products/<pid>")
@require_admin
def update_product(pid):
    fields = ['name','description','price','mrp','category','image_url','is_active']
    patch = {k:v for k,v in (request.json or {}).items() if k in fields}
    db.collection('products').document(pid).update(patch)
    return jsonify({"id": pid, **patch})

@app.delete("/api/admin/products/<pid>")
@require_admin
def delete_product(pid):
    db.collection('products').document(pid).delete()
    return jsonify({"deleted": True})

@app.post("/api/admin/upload-url")
@require_admin
def signed_upload():
    filename = (request.json or {}).get('filename')
    if not filename: return jsonify({"error":"filename required"}), 400
    path = f"products/{uuid.uuid4()}-{filename}"
    blob = products_bucket.blob(path)
    url = blob.generate_signed_url(version='v4', expiration=3600, method='PUT', content_type='application/octet-stream')
    public = f"https://storage.googleapis.com/{products_bucket.name}/{path}"
    return jsonify({"upload_url": url, "public_url": public})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
