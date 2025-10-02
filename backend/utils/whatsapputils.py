import json
import requests
import logging

from config import GUPSHUP_API_KEY, GUPSHUP_SOURCE_NUMBER

GUPSHUP_TEMPLATE_URL = "https://api.gupshup.io/wa/api/v1/template/msg"

# TO be moved to Async Tasks
def send_template_message(destination, template_id, params):
    headers = {
        "apikey": GUPSHUP_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    template_obj = {"id": template_id, "params": params}
    data = {
        "source": GUPSHUP_SOURCE_NUMBER,
        "destination": destination,
        "template": json.dumps(template_obj)
    }
    max_retries = 2
    for attempt in range(max_retries + 1):
        try:
            resp = requests.post(GUPSHUP_TEMPLATE_URL, headers=headers, data=data, timeout=15)
            # API responds asynchronously; you'll get messageId/status submitted
            return resp.status_code, resp.text
        except Exception as e:
            logging.error(f"Error sending template message (attempt {attempt+1}/{max_retries+1}): {e}")
            if attempt == max_retries:
                return None, str(e)


def send_order_confirmation(order_id, phone_number):
    params = {"order_id": order_id}
    status_code, response_text = send_template_message(phone_number, "order_confirmation", params)
    logging.info(f"ACTIVITYLOG$ORDER_CONFIRMATION$ORDERID:{order_id}$STATUS:{status_code}$RESPONSE:{response_text}")


def send_order_shipped(order_id, phone_number, tracking_link=None):
    params = {"order_id": order_id}
    if tracking_link:
        params["tracking_link"] = tracking_link
    status_code, response_text = send_template_message(phone_number, "order_shipped", params)
    logging.info(f"ACTIVITYLOG$ORDER_SHIPPED$ORDERID:{order_id}$STATUS:{status_code}$RESPONSE:{response_text}")
