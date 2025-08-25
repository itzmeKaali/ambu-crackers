from google.cloud import firestore
db = firestore.Client()
DATA = [
  {"name":"Colour Bijili (50 pcs)","category":"One Sound","mrp":1400,"price":140,"image_url":"","description":"Popular one-sound bijili.","is_active":True},
  {"name":"Gold Lakshmi (5 pcs)","category":"Lakshmi","mrp":500,"price":50,"image_url":"","description":"Lakshmi deluxe 5 pcs.","is_active":True},
]
for p in DATA:
    p['created_at'] = firestore.SERVER_TIMESTAMP
    db.collection('products').add(p)
print('Seeded')
