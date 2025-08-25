from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

def render_order_pdf(order):
    buf = BytesIO()
    p = canvas.Canvas(buf, pagesize=A4)
    w,h = A4
    y = h-40
    p.setFont("Helvetica-Bold", 16)
    p.drawString(40,y, f"AmbuCrackers Invoice #{order['order_id']}")
    y-=22; p.setFont("Helvetica",10)
    p.drawString(40,y, f"Name: {order['customer_name']}"); y-=14
    p.drawString(40,y, f"Email: {order.get('customer_email','')}  Phone: {order.get('customer_phone','')}"); y-=14
    p.drawString(40,y, f"Address: {order.get('customer_address','')}"); y-=20
    p.setFont("Helvetica-Bold",11)
    p.drawString(40,y,"Product"); p.drawString(300,y,"Qty"); p.drawString(350,y,"MRP"); p.drawString(430,y,"Ambu Price"); p.drawString(510,y,"Amount"); y-=12
    p.line(40,y,550,y); y-=14; p.setFont("Helvetica",10)
    total = 0
    for it in order.get("items", []):
        qty = int(it.get("quantity",1)); mrp = float(it.get("mrp",0)); price = float(it.get("price",0)); amt = qty*price; total += amt
        p.drawString(40,y, it.get("name","Item")[:38])
        p.drawRightString(330,y, str(qty))
        p.drawRightString(400,y, f"{mrp:.2f}")
        p.drawRightString(480,y, f"{price:.2f}")
        p.drawRightString(550,y, f"{amt:.2f}")
        y-=14
        if y<80: p.showPage(); y=h-60
    y-=6; p.line(40,y,550,y); y-=18
    p.setFont("Helvetica-Bold",12); p.drawRightString(550,y, f"Total: ₹{total:.2f}")
    p.showPage(); p.save(); return buf.getvalue()
