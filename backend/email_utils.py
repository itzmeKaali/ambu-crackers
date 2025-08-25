from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
from config import SENDGRID_API_KEY, ADMIN_EMAIL, FROM_EMAIL

def send_order_pdf_to_admin(order, pdf_bytes):
    if not SENDGRID_API_KEY or not ADMIN_EMAIL: 
        return False
    m = Mail(
        from_email=FROM_EMAIL,
        to_emails=ADMIN_EMAIL,
        subject=f"New AmbuCrackers Order #{order['order_id']}",
        html_content=(
            f"<p><b>{order.get('customer_name','')}</b> placed an order of ₹{order.get('total',0)}. "
            f"Phone: {order.get('customer_phone','')}</p>"
        ),
    )
    att = Attachment(FileContent(pdf_bytes.decode('latin1')), FileName(f"order_{order['order_id']}.pdf"), FileType("application/pdf"), Disposition("attachment"))
    m.attachment = att
    resp = SendGridAPIClient(SENDGRID_API_KEY).send(m)
    return 200 <= resp.status_code < 300
