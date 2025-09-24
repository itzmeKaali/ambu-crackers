from marshmallow import Schema, fields, validate, ValidationError

class VoucherCreateSchema(Schema):
    code = fields.Str(required=True)
    title = fields.Str(required=False)
    discount_type = fields.Str(required=True, validate=validate.OneOf(["flat", "percentage"]))
    discount_value = fields.Float(required=True, validate=validate.Range(min=2))


class VoucherListSchema(Schema):
    code = fields.Str()
    title = fields.Str(required=False)
    discount_type = fields.Str()
    discount_value = fields.Float()
    created_at = fields.DateTime()
    valid = fields.Bool()
