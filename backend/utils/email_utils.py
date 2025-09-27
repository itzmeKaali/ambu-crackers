import smtplib
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from config import GMAIL_EMAIL, GMAIL_APP_PASSWORD, ADMIN_EMAIL

def send_order_pdf_to_admin(order, pdf_bytes, recipient=ADMIN_EMAIL, is_customer=False):
    """
    Send order confirmation email with PDF attachment.
    Works for both admin and customer.
    """
    try:
        msg = MIMEMultipart()
        msg['From'] = GMAIL_EMAIL
        msg['To'] = recipient
        msg['Subject'] = (
            f"Your AmbuCrackers Order #{order['order_id']}"
            if is_customer else
            f"New AmbuCrackers Order #{order['order_id']}"
        )

        # Email body
        if is_customer:
            html_content = (
                f"<p>Dear {order.get('customer_name','')},</p>"
                f"<p>Thank you for your order of ₹{order.get('total',0)}.</p>"
                f"<p>Your order details are attached as PDF.</p>"
            )
        else:
            html_content = (
                f"<p><b>{order.get('customer_name','')}</b> placed an order of "
                f"₹{order.get('total',0)}. Phone: {order.get('customer_phone','')}</p>"
            )
        msg.attach(MIMEText(html_content, 'html'))

        # PDF attachment
        pdf_data = pdf_bytes.encode('latin1') if isinstance(pdf_bytes, str) else pdf_bytes
        attachment = MIMEApplication(pdf_data, _subtype='pdf')
        attachment.add_header('Content-Disposition', 'attachment',
                              filename=f"order_{order['order_id']}.pdf")
        msg.attach(attachment)

        # Send email
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(GMAIL_EMAIL, GMAIL_APP_PASSWORD)
            server.send_message(msg)

        return True

    except Exception as e:
        print(f"Email sending failed to {recipient}: {e}")
        return False



def send_enquiry_pdf_to_admin(enquiry):
    if not GMAIL_EMAIL or not GMAIL_APP_PASSWORD or not ADMIN_EMAIL:
        return {"success": False, "error": "Missing email configuration"}
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = GMAIL_EMAIL
        msg['To'] = ADMIN_EMAIL
        msg['Subject'] = "New AmbuCrackers Enquiry"
        
        # Email body
        html_content = (
            f"<p><b>{enquiry.get('name','')}</b> submitted an enquiry.<br>"
            f"Email: {enquiry.get('email','')}<br>"
            f"Phone: {enquiry.get('phone','')}<br>"
            f"Message: {enquiry.get('message','')}</p>"
        )
        msg.attach(MIMEText(html_content, 'html'))
        
        # Send email
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(GMAIL_EMAIL, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        
        return {"success": True}
        
    except Exception as e:
        print(f"Email sending failed: {e}")
        return {"success": False, "error": str(e)}