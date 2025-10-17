import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
	NodeConnectionType,
} from 'n8n-workflow';
import { simlaApiRequestBuilder, simlaWebhookApi } from './GenericFunctions';
import { commonProperties } from './properties/commonProperties';
import { customerProperties } from './properties/customerProperties';
import { orderProperties } from './properties/orderProperties';
import { messageProperties } from './properties/messageProperties';
import { dialogProperties } from './properties/dialogProperties';

export class Simla implements INodeType {
	description: INodeTypeDescription = {
		defaults: {
			name: 'Simla',
		},
		description: 'Consume Simla API',
		displayName: 'Simla',
		group: ['output'],
		version: [1],
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		name: 'simla',
		icon: 'file:simla.svg',
		credentials: [
			{
				name: 'simlaApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Customer',
						value: 'customer',
					},
					{
						name: 'Order',
						value: 'order',
					},
					{
						name: 'Message',
						value: 'message',
					},
					{
						name: 'Dialog',
						value: 'dialog',
					}
				],
				default: 'message',
			},
			...customerProperties,
			...orderProperties,
			...messageProperties,
			...dialogProperties,
			...commonProperties,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const credentials = await this.getCredentials('simlaApi');
		let apiUrl = credentials.apiUrl as string;
		apiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

		for (let i = 0; i < items.length; i++) {
			try {
				const req = await simlaApiRequestBuilder.buildRequest(this, { resource, operation, itemIndex: i});

				if (!req) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({
							error: `The resource "${resource}" or operation "${operation}" is not supported!`
						}),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}

				const useWhServiceUrl = resource == 'message' || resource == 'dialog';
				const baseUrl = useWhServiceUrl ? `${simlaWebhookApi.baseURL}/mg` : `${apiUrl}/api/v5`;
				const url = `${baseUrl}${req.endpoint}`

				const requestOptions: IHttpRequestOptions = {
					url,
					method: req.method,
					qs: req.qs ?? {},
					json: true,
				}

				if (useWhServiceUrl) {
					requestOptions.headers = {
						'X-Api-Url': apiUrl,
					}
				}
				requestOptions.body = req.body ?? {};

				const responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'simlaApi', requestOptions);
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData)
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
