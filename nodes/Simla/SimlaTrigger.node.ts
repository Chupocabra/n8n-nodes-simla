import {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	JsonObject,
	NodeApiError,
	NodeConnectionType
} from 'n8n-workflow';
import {simlaWebhookApi} from './GenericFunctions';

export class SimlaTrigger implements INodeType {
	description: INodeTypeDescription = {
		version: [1],
		defaults: {
			name: 'Simla Trigger',
		},
		displayName: 'Simla Trigger',
		name: 'simlaTrigger',
		icon: 'file:simla.svg',
		group: ['trigger'],
		description: 'Starts the workflow on a Simla mg event',
		inputs: [],
		outputs: [
			NodeConnectionType.Main
		],
		credentials: [
			{
				name: 'simlaApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: '={{$parameter.event}}',
			},
		],
		properties: [
			{
				displayName: 'Trigger On',
				name: 'event',
				type: 'options',
				default: 'customer_message',
				hint: 'Simla chat event',
				options: [
					{
						name: 'Customer Message',
						value: 'customer_message',
						description: 'Trigger on customer message',
					},
					{
						name: 'User Message',
						value: 'user_message',
						description: 'Trigger on user message',
					},
					{
						name: 'Dialog Assign',
						value: 'dialog_assigned',
						description: 'Trigger on dialog assign',
					},{
						name: 'Dialog Close',
						value: 'dialog_closed',
						description: 'Trigger on dialog close',
					},
				],
				required: true,
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				const event = this.getNodeParameter('event') as string;
				const webhookUrl = this.getNodeWebhookUrl('default') as string;

				// create connection and store token
				if (webhookData.secret == undefined) {
					webhookData.secret = await simlaWebhookApi.getConnection(this);
				}

				try {
					const { webhooks } = await simlaWebhookApi.fetchWebhooks(this);

					for (const webhook of webhooks) {
						if (webhook.event === event && webhookUrl === webhook.url) {
							webhookData.webhookId = webhook.id;
							return true;
						}
					}
					return false;
				} catch (err) {
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				const name = this.getWorkflow().name;
				const id = this.getWorkflow().id;
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const event = this.getNodeParameter('event') as string;

				const responseData = await simlaWebhookApi.createWebhook(this, name, id, webhookUrl, event);
				if (responseData?.id == undefined || responseData?.id == 0) {
					delete webhookData.secret;
					throw new NodeApiError(
						this.getNode(),
						responseData as JsonObject,
						{
							message: 'Workflow does not registered in Simla'
						});
				}

				webhookData.webhookId = responseData.id;

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (webhookData.webhookId !== undefined) {
					try {
						await simlaWebhookApi.deleteWebhook(this, webhookData.webhookId as string);
					} catch (error) {
						return false;
					} finally {
						// always clear webhook data in case the connection is not active
						delete webhookData.webhookId;
						delete webhookData.secret;
					}
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const webhookData = this.getWorkflowStaticData('node');

		// authorization
		const key = (this.getHeaderData()['x-api-client'] as string) || '';
		if (!key || key !== webhookData.secret) {
			const response = this.getResponseObject();
			response.status(401).json({ error: 'Unauthorized' });

			return { noWebhookResponse: true };
		}

		let bodyData = this.getBodyData();
		const response = this.getResponseObject();

		// event
		const event = this.getNodeParameter('event', 0) as string;
		const incomingEvent = (bodyData['event'] ?? '' as string)
		if (event !== incomingEvent) {
			response.status(406).json({ error: 'Event not supported' });

			return { noWebhookResponse: true };
		}

		response.status(200).json({ success: true });

		return {
			noWebhookResponse: true,
			workflowData: [
				this.helpers.returnJsonArray(bodyData as unknown as IDataObject),
			],
		}
	};
}
