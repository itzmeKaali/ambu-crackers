
from db import db

voucher_collection = db.collection("voucher")

def get_voucher_by_code(code: str):
    """Fetch a voucher from Firestore by its code"""
    doc_ref = voucher_collection.document(code).get()
    if doc_ref.exists:
        return doc_ref.to_dict()
    return None

def validate_coupon(coupon_code, data):
    # Dummy validation logic for demonstration
    try:
        amount = float(data.get("amount", 0))
    except (TypeError, ValueError):
        return {"valid": False, "error": "Invalid or missing amount"}
    coupon_code = coupon_code.strip().upper()

    voucher = get_voucher_by_code(coupon_code)
    if not voucher:
        return {"valid": False, "error": "Invalid coupon code"}

    if voucher["discount_type"] == "percentage":
        discount = voucher["discount_value"] / 100
        revised_amount = amount * (1 - discount)
        return {
            "valid": True,
            "actual_amount": amount,
            "revised_amount": revised_amount,
            "discount_type": "percentage",
            "discount_value": voucher["discount_value"]
        }
    elif voucher["discount_type"] == "flat":
        discount = voucher["discount_value"]
        revised_amount = max(0, amount - discount)
        return {
            "valid": True,
            "actual_amount": amount,
            "revised_amount": revised_amount,
            "discount_type": "flat",
            "discount_value": voucher["discount_value"]
        }
    else:
        return {"valid": False, "error": "Invalid coupon code"}