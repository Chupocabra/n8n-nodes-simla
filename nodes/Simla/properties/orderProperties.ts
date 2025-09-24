import { INodeProperties } from 'n8n-workflow';

// to save the correct interface in the workflow editor
/* eslint-disable n8n-nodes-base/node-param-fixed-collection-type-unsorted-items */
export const orderProperties: INodeProperties[] = [
	// Operation (order)
  {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
	  show: {
			resource: ['order'],
	  }
	},
	options: [
	  { name: 'Get', value: 'get', description: 'Get orders by filter', action: 'Get an order' },
	  { name: 'Create', value: 'create', description: 'Create order', action: 'Create an order' },
	  { name: 'Edit', value: 'edit', description: 'Edit order', action: 'Edit an order' },
	],
	default: 'get',
  },

	// Filter (order.get)
	{
		displayName: 'Filter',
		name: 'getFilter',
		placeholder: 'Add Property',
		type: 'fixedCollection',
		default: [],
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['get'],
			},
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
						default: 'ids',
						options: [
							{ name: 'Creation Date From', value: 'createdAtFrom' },
							{ name: 'Creation Date To', value: 'createdAtTo' },
							{ name: 'Custom Fields', value: 'customFields', description: 'Only strings are supported' },
							{ name: 'Customer ID', value: 'customerId', description: 'Customer orders' },
							{ name: 'External IDs', value: 'externalIds' },
							{ name: 'IDs', value: 'ids' },
							{ name: 'Numbers', value: 'numbers' },
							{ name: 'Sites', value: 'sites' },
							{ name: 'Statuses', value: 'extendedStatus' },
						]
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						displayOptions: {
							show: {
								key: ['customerId'],
							}
						}
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: [],
						typeOptions: {
							multipleValues: true,
						},
						displayOptions: {
							show: {
								key: ['ids', 'externalIds', 'numbers', 'extendedStatus', 'sites'],
							}
						}
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'dateTime',
						default: '',
						displayOptions: {
							show: {
								key: ['createdAtFrom', 'createdAtTo'],
							}
						}
					},
					{
						displayName: 'Custom Fields',
						name: 'customFields',
						placeholder: 'Add Field',
						type: 'fixedCollection',
						default: {},
						typeOptions: {
							multipleValues: true,
						},
						options: [
							{
								displayName: 'Custom Field',
								name: 'fields',
								values: [
									{ displayName: 'Key', name: 'key', type: 'string', default: '' },
									{ displayName: 'Value', name: 'value', type: 'string', default: '' },
								],
							}
						],
						displayOptions: {
							show: {
								key: ['customFields'],
							}
						}
					},
				],
			},
		]
	},

	// Order Data (create/edit)
	{
		displayName: 'Order Data',
		name: 'orderData',
		placeholder: 'Add Property',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['create', 'edit'],
			},
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
						default: 'items',
						options: [
							{ name: 'Custom Fields', value: 'customFields' },
							{ name: 'Customer', value: 'customer', description: 'Customer data' },
							{ name: 'Customer Comment', value: 'customerComment' },
							{ name: 'Email', value: 'email' },
							{ name: 'First Name', value: 'firstName' },
							{ name: 'Items', value: 'items' },
							{ name: 'Last Name', value: 'lastName' },
							{ name: 'Manager Comment', value: 'managerComment' },
							{ name: 'Number', value: 'number' },
							{ name: 'Phone', value: 'phone' },
							{ name: 'Status', value: 'status' },
						]
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						displayOptions: {
							hide: {
								key: ['customFields', 'items', 'customer'],
							}
						}
					},
					{
						displayName: 'Custom Fields',
						name: 'customFields',
						placeholder: 'Add Field',
						type: 'fixedCollection',
						default: {},
						typeOptions: {
							multipleValues: true,
						},
						options: [
							{
								displayName: 'Custom Field',
								name: 'fields',
								values: [
									{
										displayName: 'Key',
										name: 'key',
										type: 'string',
										default: '',
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
									},
								],
							}
						],
						displayOptions: {
							show: {
								key: ['customFields'],
							}
						}
					},
					{
						displayName: 'Items',
						name: 'items',
						placeholder: 'Add Item',
						type: 'fixedCollection',
						default: [],
						typeOptions: {
							multipleValues: true,
						},
						options: [
							{
								displayName: 'Item',
								name: 'itemCollection',
								values: [
									{
										displayName: 'Item Properties',
										name: 'properties',
										placeholder: 'Add Item Property',
										type: 'fixedCollection',
										default: [],
										typeOptions: {
											multipleValues: true,
										},
										options: [
											{
												displayName: 'Property',
												name: 'property',
												values: [
													{
														displayName: 'Item Property',
														name: 'itemProperty',
														type: 'options',
														default: 'offer',
														options: [
															{ name: 'Initial Price', value: 'initialPrice' },
															{ name: 'Quantity', value: 'quantity' },
															{ name: 'Product Name', value: 'productName' },
															{ name: 'Offer', value: 'offer' },
														],
													},
													{
														displayName: 'Value',
														name: 'value',
														type: 'string',
														default: '',
														displayOptions: {
															hide: {
																itemProperty: ['offer'],
															},
														},
													},
													{
														displayName: 'Offer',
														name: 'offer',
														type: 'fixedCollection',
														displayOptions: {
															show: {
																itemProperty: ['offer'],
															},
														},
														default: { 'byValue': { 'key': 'id', 'value': '' }},
														options: [
															{
																displayName: 'By Value',
																name: 'byValue',
																values: [
																	{
																		displayName: 'Offer By',
																		name: 'key',
																		type: 'options',
																		default: 'id',
																		options: [
																			{ name: 'ID', value: 'id' },
																			{ name: 'External ID', value: 'externalId' },
																			{ name: 'Xml ID', value: 'xmlId' },
																		],
																	},
																	{
																		displayName: 'Value',
																		name: 'value',
																		type: 'string',
																		default: '',
																	},
																],
															},
														],
													},
												]
											}
										],
									},
								],
							},
						],
						displayOptions: {
							show: {
								key: ['items'],
							}
						}
					},
					{
						displayName: 'Customer',
						name: 'customer',
						placeholder: 'Add Customer Property',
						type: 'fixedCollection',
						default: {},
						options: [
							{
								displayName: 'Customer',
								name: 'fields',
								values: [
									{
										displayName: 'Key',
										name: 'key',
										type: 'options',
										default: 'id',
										options: [
											{
												name: 'ID',
												value: 'id',
											},
										],
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
									},
								],
							}
						],
						displayOptions: {
							show: {
								key: ['customer'],
							}
						}
					},
				],
			},
		]
	},
]
