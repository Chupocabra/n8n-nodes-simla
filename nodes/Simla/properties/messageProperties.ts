import { INodeProperties } from 'n8n-workflow';

export const messageProperties: INodeProperties[] = [
	// Operation (message)
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['message'],
			}
		},
		options: [
			{
				name: 'Send',
				value: 'send',
				action: 'Send a message to chat',
			},
		],
		default: 'send',
	},

	// Message Data (send)
	{
		displayName: 'Message Data',
		name: 'messageData',
		placeholder: 'Add Property',
		type: 'fixedCollection',
		default: {
			options: {
				type: 'text',
				content: ''
			}
		},
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['send'],
			}
		},
		options: [
			{
				displayName: 'Properties',
				name: 'properties',
				values: [
					{
						displayName: 'Scope',
						name: 'scope',
						type: 'options',
						default: 'public',
						options: [
							{
								name: 'Public',
								value: 'public',
							},
							{
								name: 'Private',
								value: 'private',
							}
						]
					},
					{
						displayName: 'Content',
						name: 'content',
						type: 'string',
						default: '',
					}
				]
			}
		],
	},
	{
		displayName: 'Chat ID',
		name: 'chatId',
		type: 'string',
		default: '={{ $json.body.chatId }}',
		displayOptions: {
			show: {
				resource: ['message'],
			}
		},
		required: true,
	},
]
