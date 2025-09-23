


def validate_coupon(coupon_code, data):
    # Dummy validation logic for demonstration
    try:
        amount = float(data.get("amount", 0))
    except (TypeError, ValueError):
        return {"valid": False, "error": "Invalid or missing amount"}

    if coupon_code == "BLACKFRIDAY":
        discount = 0.2  # 20% discount
        discount_type = "percentage"
        discount_value = discount * 100
        revised_amount = amount * (1 - discount)
        return {
            "valid": True,
            "actual_amount": amount,
            "revised_amount": revised_amount,
            "discount_type": discount_type,
            "discount_value": discount_value
        }
    elif coupon_code == "FLAT100":
        discount = 100  # Flat 100 off
        discount_type = "flat"
        discount_value = discount
        revised_amount = max(0, amount - discount_value)
        return {
            "valid": True,
            "actual_amount": amount,
            "revised_amount": revised_amount,
            "discount_type": discount_type,
            "discount_value": discount_value
        }
    else:
        return {"valid": False, "error": "Invalid coupon code"}