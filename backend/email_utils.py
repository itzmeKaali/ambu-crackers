# from sendgrid import SendGridAPIClient
# from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
# from config import SENDGRID_API_KEY, ADMIN_EMAIL, FROM_EMAIL

# def send_order_pdf_to_admin(order, pdf_bytes):
#     if not SENDGRID_API_KEY or not ADMIN_EMAIL: 
#         return False
#     m = Mail(
#         from_email=FROM_EMAIL,
#         to_emails=ADMIN_EMAIL,
#         subject=f"New AmbuCrackers Order #{order['order_id']}",
#         html_content=(
#             f"<p><b>{order.get('customer_name','')}</b> placed an order of ₹{order.get('total',0)}. "
#             f"Phone: {order.get('customer_phone','')}</p>"
#         ),
#     )
#     att = Attachment(FileContent(pdf_bytes.decode('latin1')), FileName(f"order_{order['order_id']}.pdf"), FileType("application/pdf"), Disposition("attachment"))
#     m.attachment = att
#     resp = SendGridAPIClient(SENDGRID_API_KEY).send(m)
#     return 200 <= resp.status_code < 300


import smtplib
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from config import GMAIL_EMAIL, GMAIL_APP_PASSWORD, ADMIN_EMAIL

def send_order_pdf_to_admin(order, pdf_bytes):
    if not GMAIL_EMAIL or not GMAIL_APP_PASSWORD or not ADMIN_EMAIL:
        return False
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = GMAIL_EMAIL
        msg['To'] = ADMIN_EMAIL
        msg['Subject'] = f"New AmbuCrackers Order #{order['order_id']}"
        
        # Email body
        html_content = (
            f"<p><b>{order.get('customer_name','')}</b> placed an order of ₹{order.get('total',0)}. "
            f"Phone: {order.get('customer_phone','')}</p>"
        )
        msg.attach(MIMEText(html_content, 'html'))
        
        # PDF attachment
        if isinstance(pdf_bytes, str):
            pdf_data = pdf_bytes.encode('latin1')
        else:
            pdf_data = pdf_bytes
            
        attachment = MIMEApplication(pdf_data, _subtype='pdf')
        attachment.add_header('Content-Disposition', 'attachment', filename=f"order_{order['order_id']}.pdf")
        msg.attach(attachment)
        
        # Send email
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(GMAIL_EMAIL, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        
        return True
        
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False