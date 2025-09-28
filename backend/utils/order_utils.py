
from db import db

voucher_collection = db.collection("voucher")

def get_voucher_by_code(code: str):
    """Fetch a voucher from Firestore by its code"""
    doc_ref = voucher_collection.document(code).get()
    if doc_ref.exists:
        return doc_ref.to_dict()
    return None

def validate_coupon(coupon_code):
    coupon_code = coupon_code.strip()

    voucher = get_voucher_by_code(coupon_code)

    if voucher:
        return {
            "valid": True,
            "discount_value": voucher["discount_value"]
        }
    else:
        return {"valid": False, "error": "Invalid coupon code"}