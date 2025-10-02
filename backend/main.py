from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import firestore, storage
from datetime import datetime
import uuid, json
from authz import require_admin, get_user_from_request
from utils.pdf_utils import render_order_pdf
from utils.email_utils import send_order_pdf_to_admin, send_enquiry_pdf_to_admin
from config import ORDERS_BUCKET, PRODUCTS_BUCKET, PRICE_LIST_BLOB, FRONTEND_ORIGIN, GUPSHUP_API_KEY
from marshmallow import ValidationError
from schema import VoucherCreateSchema, VoucherListSchema

from db import db

from utils.order_utils import validate_coupon
# from utils.whatsapputils import send_order_confirmation, send_order_shipped


app = Flask(__name__)
CORS(app, origins=[FRONTEND_ORIGIN, "http://localhost:5173"], supports_credentials=True)

# --- Common error handler ---
def api_error_response(error, status=500):
    return jsonify({
        "success": False,
        "error": str(error)
    }), status


storage_client = storage.Client()
orders_bucket = storage_client.bucket(ORDERS_BUCKET)
products_bucket = storage_client.bucket(PRODUCTS_BUCKET)

voucher_create_schema = VoucherCreateSchema()
voucher_list_schema = VoucherListSchema(many=True)
voucher_collection = db.collection("voucher")

# -------- Public --------
@app.get("/api/products")
def list_products():

    try:
        cat = request.args.get('category')
        q = db.collection("products").where("is_active","==",True)
        if cat: q = q.where("category","==",cat)
        docs = q.order_by("created_at", direction=firestore.Query.ASCENDING).stream()
        out = []
        for d in docs:
            x = d.to_dict(); x["id"] = d.id; out.append(x)
        return jsonify(out)
    except Exception as e:
        return api_error_response(e)

@app.get("/api/price-list-url")
def price_list_url():
    try:
        blob = products_bucket.blob(PRICE_LIST_BLOB)
        url = blob.generate_signed_url(version='v4', expiration=3600, method='GET')
        return jsonify({"url": url})
    except Exception as e:
        return api_error_response(e)

@app.get("/api/orders/apply-coupon")
def apply_coupon():
    try:
        coupon_code = request.args.get("code")
        data = request.get_json(silent=True)

        if not coupon_code:
            return jsonify({"error": "Coupon code is required"}), 400

        result = validate_coupon(coupon_code)
        if not result.get("valid"):
            return jsonify({"error": result.get("error", "Invalid coupon code")}), 400
        
        response = {k: v for k, v in result.items() if k != "valid"}
        return jsonify(response)
    except Exception as e:
        return api_error_response(e)



@app.post("/api/orders/quick-checkout")
def quick_checkout():
    try:
        data = request.json or {}
        order_id = str(uuid.uuid4())
        data['order_id'] = order_id
        data['created_at'] = datetime.utcnow().isoformat()
        data['status'] = "NOT_ENQUIRED"  # default new orders
        data['order_pdf'] = None

        # Save order JSON first
        orders_bucket.blob(f"orders/{order_id}.json").upload_from_string(
            json.dumps(data),
            content_type='application/json'
        )

        # Generate PDF
        pdf = render_order_pdf(data)

        # Upload PDF to bucket
        pdf_blob = orders_bucket.blob(f"pdf/{order_id}.pdf")
        pdf_blob.upload_from_string(pdf, content_type="application/pdf")

        pdf_url = pdf_blob.public_url
        data["order_pdf"] = pdf_url

        # Save updated JSON with PDF URL
        orders_bucket.blob(f"orders/{order_id}.json").upload_from_string(
            json.dumps(data),
            content_type='application/json'
        )

        # Send email to admin and customer
        emailed_admin = send_order_pdf_to_admin(
            order=data,
            pdf_bytes=pdf
        )
        emailed_customer = False
        if data.get("customer_email"):
            emailed_customer = send_order_pdf_to_admin(
                recipient=data["customer_email"],
                order=data,
                pdf_bytes=pdf,
                is_customer=True
            )

        # Send WhatsApp message (optional)
        # if data.get("customer_phone") and GUPSHUP_API_KEY:
        #     send_order_confirmation(
        #         order_id,
        #         destination=data["customer_phone"]
        #     )

        return jsonify({
            "order_id": order_id,
            "emailed_admin": emailed_admin,
            "emailed_customer": emailed_customer,
            # "whatsapp_sent": whatsapp_sent,
            "order_pdf": pdf_url
        })
    except Exception as e:
        return api_error_response(e)



@app.post("/api/enquiry")
def enquiry():
    try:
        payload = request.json or {}
        payload['id'] = str(uuid.uuid4())
        payload['created_at'] = datetime.utcnow().isoformat()
        orders_bucket.blob(f"enquiries/{payload['id']}.json").upload_from_string(json.dumps(payload), content_type='application/json')
        emailed = send_enquiry_pdf_to_admin(payload)
        return jsonify({"ok": True, "email": emailed})
    except Exception as e:
        return api_error_response(e)

@app.get("/api/me")
@require_admin
def me():
    try:
        u = get_user_from_request()
        return jsonify(u or {}), (200 if u else 401)
    except Exception as e:
        return api_error_response(e)

# -------- Admin --------
@app.post("/api/admin/upload-url")
@require_admin
def upload_image():
    """
    Uploads image directly to GCS and returns public URL
    """
    try:
        file = request.files.get("file")
        if not file or not file.filename:
            return jsonify({"error": "No file provided"}), 400

        # Create unique path
        path = f"products/{uuid.uuid4()}-{file.filename}"
        blob = products_bucket.blob(path)

        # Upload file
        blob.upload_from_file(file, content_type=file.content_type)

        return jsonify({"public_url": blob.public_url})
    except Exception as e:
        return api_error_response(e)

@app.patch("/api/admin/orders/<order_id>/status")
# @require_admin
def update_order_status(order_id):
    """Update only the status field of an order"""
    try:
        data = request.json or {}
        new_status = data.get("status")

        allowed_status = ["NOT_ENQUIRED", "IN_PROGRESS", "DELIVERED", "ABORTED"]
        if new_status not in allowed_status:
            return jsonify({"error": f"Invalid status. Allowed: {allowed_status}"}), 400

        blob = orders_bucket.blob(f"orders/{order_id}.json")
        if not blob.exists():
            return jsonify({"error": "Order not found"}), 404

        order_data = json.loads(blob.download_as_string())
        order_data["status"] = new_status

        # Save back to GCS
        blob.upload_from_string(
            json.dumps(order_data),
            content_type="application/json"
        )

        return jsonify({"message": "Status updated", "order": order_data})
    except Exception as e:
        return api_error_response(e)



@app.post("/api/admin/products")
@require_admin
def create_product():
    """
    Create a product with JSON payload, expects 'image_url' from previous upload
    """
    try:
        doc = request.json or {}

        # Validate name
        name = doc.get("name", "").strip()
        if not name:
            return jsonify({"error": "Product name is required"}), 400

        # Check duplicate name
        existing = db.collection("products").where("name", "==", name).limit(1).get()
        if existing:
            return jsonify({"error": "Product with this name already exists"}), 400

        # Convert numeric/boolean fields safely
        try:
            if "mrp" in doc:
                doc["mrp"] = float(doc["mrp"])
            if "price" in doc:
                doc["price"] = float(doc["price"])
        except ValueError:
            return jsonify({"error": "Invalid price/mrp"}), 400

        doc["is_active"] = str(doc.get("is_active", "true")).lower() in ("true", "1")
        doc["created_at"] = firestore.SERVER_TIMESTAMP

        ref = db.collection("products").add(doc)[1]
        snap = ref.get()

        return jsonify({"id": ref.id, **snap.to_dict()}), 201
    except Exception as e:
        return api_error_response(e)


@app.get("/api/admin/orders")
# @require_admin
def orders():
    """Fetch all orders from GCS"""
    try:
        blobs = storage_client.list_blobs(ORDERS_BUCKET, prefix="orders/")
        orders = []
        for blob in blobs:
            if not blob.name.endswith(".json"):
                continue
            data = blob.download_as_string()
            try:
                order = json.loads(data)
                orders.append(order)
            except json.JSONDecodeError:
                continue
        # Sort by created_at descending
        orders.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return jsonify(orders)
    except Exception as e:
        return api_error_response(e)

@app.put("/api/admin/products/<pid>")
@require_admin
def update_product(pid):
    try:
        fields = ["name", "description", "price", "mrp", "category", "image_url", "is_active"]
        patch = {k: v for k, v in (request.json or {}).items() if k in fields}

        # Validate name uniqueness if updated
        if "name" in patch:
            name = patch["name"].strip()
            existing = (
                db.collection("products")
                .where("name", "==", name)
                .limit(1)
                .get()
            )
            if existing and existing[0].id != pid:
                return jsonify({"error": "Another product with this name already exists"}), 400
            patch["name"] = name

        # Convert numeric/boolean if present
        try:
            if "mrp" in patch:
                patch["mrp"] = float(patch["mrp"])
            if "price" in patch:
                patch["price"] = float(patch["price"])
            if "is_active" in patch:
                patch["is_active"] = str(patch["is_active"]).lower() in ("true", "1")
        except ValueError:
            return jsonify({"error": "Invalid numeric/boolean value"}), 400

        db.collection("products").document(pid).update(patch)
        return jsonify({"id": pid, **patch})
    except Exception as e:
        return api_error_response(e)


@app.delete("/api/admin/products/<pid>")
@require_admin
def delete_product(pid):
    try:
        db.collection('products').document(pid).delete()
        return jsonify({"deleted": True})
    except Exception as e:
        return api_error_response(e)


# --- Voucher API (now under /api/vouchers) ---
@app.route("/api/vouchers", methods=["GET"])
@require_admin
def list_vouchers():
    """Fetch all vouchers from Firestore"""
    try:
        docs = voucher_collection.stream()
        vouchers = [doc.to_dict() for doc in docs]
        return jsonify(voucher_list_schema.dump(vouchers))
    except Exception as e:
        return api_error_response(e)


@app.route("/api/vouchers", methods=["POST"])
@require_admin
def create_voucher():
    """Create a voucher in Firestore"""
    try:
        try:
            data = voucher_create_schema.load(request.get_json())
        except ValidationError as err:
            return jsonify({"errors": err.messages}), 400

        # Check if voucher with same code already exists
        existing = voucher_collection.document(data["code"]).get()
        if existing.exists:
            return jsonify({"error": "Voucher code already exists"}), 400

        # Save using code as document ID
        voucher_collection.document(data["code"]).set(data)
        return jsonify(data), 201
    except Exception as e:
        return api_error_response(e)


@app.route("/api/vouchers/<string:code>", methods=["DELETE"])
@require_admin
def delete_voucher(code):
    """Delete a voucher by code"""
    try:
        doc_ref = voucher_collection.document(code)
        if not doc_ref.get().exists:
            return jsonify({"error": "Voucher not found"}), 404

        doc_ref.delete()
        return jsonify({"message": f"Voucher '{code}' deleted successfully"})
    except Exception as e:
        return api_error_response(e)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
