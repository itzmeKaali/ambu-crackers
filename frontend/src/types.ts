export type Product = {
	id: string;
	name: string;
	description: string;
	price: number;
	mrp: number;
	image_url?: string;
	category?: string;
	is_active: boolean;
	sequence_number?: number;
};

export type CartItem = {
	id: string;
	name: string;
	quantity: number;
	price: number;
	mrp: number;
};
