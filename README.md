# AmbuCrackers — React + Flask (GCP App Engine)

## What you get
- React (Vite + TS) static **web** service
- Flask API **api** service
- Products in Firestore (no SQL), Orders/Enquiries as JSON in GCS
- Signed URL image upload to GCS
- PDF invoice (ReportLab) emailed to admin (SendGrid)
- Firebase Auth admin gate (custom claim or `roles/{uid}` doc)

## Setup
1. Create GCP project, enable App Engine (asia-south1 recommended), Firestore (Native), Cloud Storage.
2. Create buckets: one for **orders** (JSON) and one for **products** (images, price list PDF).
3. Firebase: create web app, enable Email/Password auth; note apiKey/authDomain/projectId.
4. Set backend `app.yaml` env vars.
5. Frontend: copy `.env.example` to `.env` and fill Firebase keys.

## Local run
```bash
# backend
cd backend
pip install -r requirements.txt
# for linux
export ORDERS_BUCKET=your-orders-bucket
export PRODUCTS_BUCKET=your-products-bucket
export PRICE_LIST_BLOB=price-list/ambucrackers-price-list.pdf

#for cmd prompt
set ORDERS_BUCKET=oders-bucket
set PRODUCTS_BUCKET=crackers-bucket
set PRICE_LIST_BLOB=price-list/ambucrackers-price-list.pdf

python main.py

# frontend
cd ../frontend
npm i
npm run dev
```

## Deploy
```bash
# backend
cd backend
gcloud app deploy app.yaml

# frontend (build first)
cd ../frontend
npm i
npm run build
gcloud app deploy app.yaml
```

## Grant admin
```bash
cd scripts
python grant_admin_once.py  # enter email; sets custom claim {admin:true}
```
