import { INodeProperties } from 'n8n-workflow';

// to save the correct interface in the workflow editor
/* eslint-disable n8n-nodes-base/node-param-fixed-collection-type-unsorted-items */
export const customerProperties: INodeProperties[] = [
	// Operation (customer)
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customer']
			}
		},
		options: [
			{ name: 'Get', value: 'get', description: 'Get customers by filter', action: 'Get a customer' },
			{ name: 'Create', value: 'create', description: 'Create customer', action: 'Create a customer' },
			{ name: 'Edit', value: 'edit', description: 'Edit customer', action: 'Edit a customer' },
		],
		default: 'get',
	},

	// Filter (customer.get)
	{
		displayName: 'Filter',
		name: 'getFilter',
		placeholder: 'Add Property',
		type: 'fixedCollection',
		default: [],
		typeOptions: { multipleValues: true },
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['get']
			}
		},
		options: [
			{
				displayName: 'Properties',
				name: 'properties',
				values: [
					{
						displayName: 'Property',
						name: 'key',
						type: 'options',
						default: 'mgCustomerId',
						options: [
							{ name: 'Custom Fields', value: 'customFields', description: 'Only strings are supported' },
							{ name: 'Email', value: 'email' },
							{ name: 'External IDs', value: 'externalIds' },
							{ name: 'IDs', value: 'ids' },
							{ name: 'MG Customer ID', value: 'mgCustomerId', description: 'Saved in workflow by the trigger' },
							{ name: 'Name', value: 'name', description: 'Search by name and phone' },
							{ name: 'Registration Date From', value: 'dateFrom' },
							{ name: 'Registration Date To', value: 'dateTo' },
							{ name: 'Sites', value: 'sites' },
							{ name: 'Tags', value: 'tags' },
						],
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						displayOptions: {
							show: {
								key: ['mgCustomerId', 'name', 'email']
							}
						},
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: [],
						typeOptions: { multipleValues: true },
						displayOptions: {
							show: {
								key: ['ids', 'externalIds', 'sites', 'tags']
							}
						},
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'dateTime',
						default: '',
						displayOptions: {
							show: {
								key: ['dateFrom', 'dateTo']
							}
						},
					},
					{
						displayName: 'Custom Fields',
						name: 'customFields',
						placeholder: 'Add Field',
						type: 'fixedCollection',
						default: {},
						typeOptions: { multipleValues: true },
						options: [
							{
								displayName: 'Custom Field',
								name: 'fields',
								values: [
									{ displayName: 'Key', name: 'key', type: 'string', default: '' },
									{ displayName: 'Value', name: 'value', type: 'string', default: '' },
								],
							},
						],
						displayOptions: {
							show: {
								key: ['customFields']
							}
						},
					},
				],
			},
		],
	},

	// Customer Data (create/edit)
	{
		displayName: 'Customer Data',
		name: 'customerData',
		placeholder: 'Add Property',
		type: 'fixedCollection',
		default: [],
		typeOptions: { multipleValues: true },
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create', 'edit']
			}
		},
		options: [
			{
				displayName: 'Properties',
				name: 'properties',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'options',
						default: 'firstName',
						options: [
							{ name: 'Add Tags', value: 'addTags' },
							{ name: 'Attached Tag', value: 'attachedTag' },
							{ name: 'Custom Fields', value: 'customFields' },
							{ name: 'Email', value: 'email' },
							{ name: 'First Name', value: 'firstName' },
							{ name: 'Last Name', value: 'lastName' },
							{ name: 'MG Customer ID', value: 'mgCustomerId' },
							{ name: 'Patronymic', value: 'patronymic' },
							{ name: 'Phones', value: 'phones' },
							{ name: 'Remove Tags', value: 'removeTags' },
						],
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						displayOptions: {
							hide: {
								key: ['phones', 'customFields', 'addTags', 'removeTags']
							}
						},
					},
					{
						displayName: 'Phones',
						name: 'phones',
						placeholder: 'Add Phone',
						type: 'fixedCollection',
						default: [],
						typeOptions: { multipleValues: true },
						options: [
							{
								displayName: 'Phone',
								name: 'phones',
								values: [{ displayName: 'Number', name: 'number', type: 'string', default: '' }],
							},
						],
						displayOptions: {
							show: {
								key: ['phones']
							}
						},
					},
					{
						displayName: 'Custom Fields',
						name: 'customFields',
						placeholder: 'Add Field',
						type: 'fixedCollection',
						default: {},
						typeOptions: { multipleValues: true },
						options: [
							{
								displayName: 'Custom Field',
								name: 'fields',
								values: [
									{ displayName: 'Key', name: 'key', type: 'string', default: '' },
									{ displayName: 'Value', name: 'value', type: 'string', default: '' },
								],
							},
						],
						displayOptions: {
							show: {
								key: ['customFields']
							}
						},
					},
					{
						displayName: 'Tags',
						name: 'addTags',
						type: 'string',
						default: [],
						typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Tag' },
						displayOptions: {
							show: {
								key: ['addTags']
							}
						},
					},
					{
						displayName: 'Tags',
						name: 'removeTags',
						type: 'string',
						default: [],
						typeOptions: { multipleValues: true, multipleValueButtonText: 'Add Tag' },
						displayOptions: {
							show: {
								key: ['removeTags']
							}
						},
					},
				],
			},
		],
	},
];
