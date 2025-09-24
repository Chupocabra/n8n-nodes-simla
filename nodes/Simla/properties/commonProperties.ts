import { INodeProperties } from 'n8n-workflow';

export const commonProperties: INodeProperties[] = [
	// ID, site (create/edit)
	{
		displayName: 'ID',
		name: 'id',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['customer', 'order'],
				operation: ['edit'],
			},
		},
		required: true,
	},
	{
		displayName: 'Site',
		name: 'site',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['customer', 'order'],
				operation: ['create', 'edit'],
			},
		},
		required: true,
	},

	// Pagination (get)
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'options',
		options: [
			{ name: '20', value: 20 },
			{ name: '50', value: 50 },
			{ name: '100', value: 100 },
		],
		default: 20,
		displayOptions: {
			show: {
				resource: ['customer', 'order'],
				operation: ['get'],
			},
		},
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		default: 1,
		displayOptions: {
			show: {
				resource: ['customer', 'order'],
				operation: ['get'],
			},
		},
	},
]
