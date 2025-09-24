import { INodeProperties } from 'n8n-workflow';

export const dialogProperties: INodeProperties[] = [
	// Operation (dialog)
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['dialog'],
			}
		},
		options: [
			{
				name: 'Assign',
				value: 'assign',
				action: 'Assign a dialog to a user or bot',
			},
			{
				name: 'Unassign',
				value: 'unassign',
				action: 'Unassign a dialog',
			},
			{
				name: 'Close',
				value: 'close',
				action: 'Close a dialog',
			},
		],
		default: 'close',
	},

	// Dialog Data (assign/unassign/close)
	{
		displayName: 'Dialog Data',
		name: 'dialogData',
		placeholder: 'Add Property',
		type: 'fixedCollection',
		default: {},
		displayOptions: {
			show: {
				resource: ['dialog'],
				operation: ['assign'],
			}
		},
		options: [
			{
				displayName: 'Properties',
				name: 'properties',
				values: [
					{
						displayName: 'Assign',
						name: 'key',
						type: 'options',
						default: 'userId',
						options: [
							{
								name: 'Bot',
								value: 'botId',
							},
							{
								name: 'User',
								value: 'userId',
							}
						]
					},
					{
						displayName: 'ID',
						name: 'value',
						type: 'number',
						default: '',
					}
				]
			}
		],
	},
	{
		displayName: 'Dialog ID',
		name: 'dialogId',
		type: 'string',
		default: '={{ json.body.dialogId }}',
		displayOptions: {
			show: {
				resource: ['dialog'],
			}
		},
	},
]
