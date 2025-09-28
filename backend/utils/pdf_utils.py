from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

def render_order_pdf(order):
    buf = BytesIO()
    p = canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    y = h - 40
    
    # Header
    p.setFont("Helvetica-Bold", 16)
    p.drawString(40, y, f"AmbuCrackers Invoice #{order.get('order_id', 'N/A')}")
    y -= 22
    
    # Customer Info
    p.setFont("Helvetica", 10)
    p.drawString(40, y, f"Name: {order.get('customer_name', 'N/A')}")
    y -= 14
    p.drawString(40, y, f"Email: {order.get('customer_email', 'N/A')}  Phone: {order.get('customer_phone', 'N/A')}")
    y -= 14
    p.drawString(40, y, f"Address: {order.get('customer_address', 'N/A')}")
    y -= 20
    
    # Table Header
    p.setFont("Helvetica-Bold", 11)
    p.drawString(40, y, "Product")
    p.drawString(300, y, "Qty")
    p.drawString(350, y, "MRP")
    p.drawString(430, y, "Ambu Price")
    p.drawString(510, y, "Amount")
    y -= 12
    p.line(40, y, 550, y)
    y -= 14
    
    # Items
    p.setFont("Helvetica", 10)
    subtotal = 0
    for item in order.get("items", []):
        qty = int(item.get("quantity", 1))
        mrp = float(item.get("mrp", 0))
        price = float(item.get("price", 0))
        amt = qty * price
        subtotal += amt
        
        p.drawString(40, y, item.get("name", "Item")[:38])
        p.drawRightString(330, y, str(qty))
        p.drawRightString(400, y, f"₹{mrp:.2f}")
        p.drawRightString(480, y, f"₹{price:.2f}")
        p.drawRightString(550, y, f"₹{amt:.2f}")
        y -= 14
        
        if y < 120:  # Leave more space for totals section
            p.showPage()
            y = h - 60
    
    # Totals section
    y -= 6
    p.line(40, y, 550, y)
    y -= 18
    
    # Show subtotal
    p.setFont("Helvetica", 11)
    p.drawRightString(480, y, "Subtotal:")
    p.drawRightString(550, y, f"₹{subtotal:.2f}")
    y -= 16
    
    # Get the final total from order (which includes discount)
    final_total = float(order.get('total', subtotal))
    
    # Show discount if applicable (when coupon was applied)
    if final_total < subtotal:
        discount_amount = subtotal - final_total
        discount_percentage = (discount_amount / subtotal) * 100 if subtotal > 0 else 0
        
        p.setFont("Helvetica", 10)
        p.drawRightString(480, y, f"Discount ({discount_percentage:.0f}% off):")
        p.drawRightString(550, y, f"-₹{discount_amount:.2f}")
        y -= 16
        
        # Show coupon code if available
        coupon_code = order.get('coupon_code')
        if coupon_code and coupon_code.strip():
            p.setFont("Helvetica", 9)
            p.drawRightString(480, y, f"Coupon: {coupon_code}")
            y -= 14
    
    # Final total
    p.setFont("Helvetica-Bold", 12)
    p.drawRightString(480, y, "Total:")
    p.drawRightString(550, y, f"₹{final_total:.2f}")
    
    # Add a note if discount was applied
    if final_total < subtotal:
        y -= 20
        p.setFont("Helvetica", 9)
        p.drawString(40, y, f"You saved ₹{subtotal - final_total:.2f} with your coupon!")
    
    p.showPage()
    p.save()
    return buf.getvalue()