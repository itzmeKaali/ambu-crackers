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
CORS(app, origins=[FRONTEND_ORIGIN, 'http://localhost:5173', 'https://keen-snow-470010-a7.el.r.appspot.com'], supports_credentials=True)

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
    u = get_user_from_request()
    return jsonify(u or {}), (200 if u else 401)

# -------- Admin --------
@app.post("/api/admin/upload-url")
@require_admin
def upload_image():
    """
    Uploads image directly to GCS and returns public URL
    """
    file = request.files.get("file")
    if not file or not file.filename:
        return jsonify({"error": "No file provided"}), 400

    # Create unique path
    path = f"products/{uuid.uuid4()}-{file.filename}"
    blob = products_bucket.blob(path)

    # Upload file
    blob.upload_from_file(file, content_type=file.content_type)

    # Make it public
    blob.make_public()

    return jsonify({"public_url": blob.public_url})


@app.post("/api/admin/products")
@require_admin
def create_product():
    """
    Create a product with JSON payload, expects 'image_url' from previous upload
    """
    doc = request.json or {}

    # Convert numeric/boolean fields safely
    try:
        if "mrp" in doc:
            doc["mrp"] = float(doc["mrp"])
        if "price" in doc:
            doc["price"] = float(doc["price"])
    except ValueError:
        return jsonify({"error": "Invalid price/mrp"}), 400

    doc["is_active"] = str(doc.get("is_active", "true")).lower() in ("true", "1")
    doc['created_at'] = firestore.SERVER_TIMESTAMP

    ref = db.collection('products').add(doc)[1]
    snap = ref.get()

    return jsonify({"id": ref.id, **snap.to_dict()}), 201


@app.put("/api/admin/products/<pid>")
@require_admin
def update_product(pid):
    fields = ['name','description','price','mrp','category','image_url','is_active']
    patch = {k: v for k, v in (request.json or {}).items() if k in fields}

    # Convert numeric/boolean if present
    try:
        if "mrp" in patch: patch["mrp"] = float(patch["mrp"])
        if "price" in patch: patch["price"] = float(patch["price"])
        if "is_active" in patch: patch["is_active"] = str(patch["is_active"]).lower() in ("true", "1")
    except ValueError:
        return jsonify({"error": "Invalid numeric/boolean value"}), 400

    db.collection('products').document(pid).update(patch)
    return jsonify({"id": pid, **patch})


@app.delete("/api/admin/products/<pid>")
@require_admin
def delete_product(pid):
    db.collection('products').document(pid).delete()
    return jsonify({"deleted": True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
