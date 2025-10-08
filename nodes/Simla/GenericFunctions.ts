import {
	IDataObject, IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	JsonObject,
	NodeApiError
} from 'n8n-workflow';

interface WebhookDetails {
	url: string;
	id: number;
	description: string;
	event: string;
	createdAt: string;
	modifiedAt: string;
}

interface Webhooks {
	webhooks: WebhookDetails[];
}

class SimlaWebhookApi {
	private readonly credentialsName = 'simlaApi';
	public readonly baseURL = 'https://n8n-go.retailcrm.tech';

	public async getConnection(ref: IHookFunctions): Promise<string> {
		const credentials = await ref.getCredentials(this.credentialsName);

		const options: IHttpRequestOptions = {
			url: `${this.baseURL}/connection`,
			method: 'POST',
			body: {
				crmUrl: credentials.apiUrl,
				crmApiKey: credentials.apiKey,
			},
			json: true,
		};

		try {
			const response = (await ref.helpers.httpRequest(options)) as { client_id: string };
			return response.client_id;
		} catch (error) {
			throw new NodeApiError(ref.getNode(), error as JsonObject);
		}
	}

	public async fetchWebhooks(ref: IHookFunctions): Promise<Webhooks> {
		const credentials = await ref.getCredentials(this.credentialsName);

		const options: IHttpRequestOptions = {
			url: `${this.baseURL}/api/v1/workflow`,
			method: 'GET',
			headers: {
				'X-Api-Key': credentials.apiKey as string,
				'X-Api-Url': credentials.apiUrl as string,
			},
			json: true,
		};

		try {
			const res = await ref.helpers.httpRequest(options);
			return res as Webhooks;
		} catch (error) {
			throw new NodeApiError(ref.getNode(), error as JsonObject);
		}
	};

	public async createWebhook(
		ref: IHookFunctions,
		name: string|undefined,
		id: string|undefined,
		webhookUrl: string,
		event: string,
		byAssign: boolean,
	): Promise<any> {
		const credentials = await ref.getCredentials(this.credentialsName);

		const options: IHttpRequestOptions = {
			url: `${this.baseURL}/api/v1/workflow`,
			method: 'POST',
			headers: {
				'X-Api-Key': credentials.apiKey as string,
				'X-Api-Url': credentials.apiUrl as string
			},
			body: {
				name,
				n8nId: id,
				webhookUrl,
				event,
				byAssign
			},
			json: true,
		};

		try {
			return await ref.helpers.httpRequest(options)
		} catch (error) {
			throw new NodeApiError(ref.getNode(), error as JsonObject);
		}
	};

	public async deleteWebhook(ref: IHookFunctions, webhookId: string): Promise<boolean> {
		const credentials = await ref.getCredentials(this.credentialsName);

		const options: IHttpRequestOptions = {
			url: `${this.baseURL}/api/v1/workflow`,
			method: 'DELETE',
			qs: {
				id: webhookId
			},
			headers: {
				'X-Api-Key': credentials.apiKey as string,
				'X-Api-Url': credentials.apiUrl as string
			},
			json: true,
		};

		try {
			return await ref.helpers.httpRequest(options);
		} catch (error) {
			throw new NodeApiError(ref.getNode(), error as JsonObject);
		}
	}
}

export const simlaWebhookApi = new SimlaWebhookApi();

interface RequestConfig {
	endpoint: string;
	method: IHttpRequestMethods;
	qs?: IDataObject;
	body?: IDataObject;
}

interface BuildArgs {
	resource: string;
	operation: string;
	itemIndex: number;
}

type Builder = (ctx: IExecuteFunctions, i: number) => RequestConfig;

class SimlaApiRequestBuilder {
	private readonly registry: Record<string, Record<string, Builder>>;

	public constructor() {
		this.registry = {
			customer: {
				get: this.buildCustomerGet.bind(this),
				create: this.buildCustomerCreate.bind(this),
				edit: this.buildCustomerEdit.bind(this),
			},
			order: {
				get: this.buildOrderGet.bind(this),
				create: this.buildOrderCreate.bind(this),
				edit: this.buildOrderEdit.bind(this),
			},
			message: {
				send: this.buildMessageSend.bind(this),
			},
			dialog: {
				assign: this.buildDialogAssign.bind(this),
				unassign: this.buildDialogUnassign.bind(this),
				close: this.buildDialogClose.bind(this),
			},
		};
	}

	public buildRequest(ref: IExecuteFunctions, args: BuildArgs): RequestConfig | undefined {
		const { resource, operation, itemIndex } = args;
		const group = this.registry[resource];
		const builder = group?.[operation];
		return builder ? builder(ref, itemIndex) : undefined;
	}

	// helpers
	private toObject(data: IDataObject[]): IDataObject | undefined {
		if (typeof data === 'undefined') {
			return undefined;
		}

		return Object.fromEntries(data.map(item => [item.key, item.value]));
	};

	private keyValueToObject(data: IDataObject[], itemKey: string): IDataObject | undefined {
		const entry = data.find(item => item.key === itemKey) as IDataObject | undefined;
		const collection = entry?.[itemKey];
		if (collection && typeof collection === 'object') {
			const fields = (collection as IDataObject).fields as IDataObject | undefined;
			if (Array.isArray(fields)) {
				return this.toObject(fields);
			}

			if (typeof fields === 'object') {
				return this.toObject([fields]);
			}
		}

		return undefined;
	}

	private toCustomerData(data: IDataObject[]): IDataObject | undefined {
		if (typeof data === 'undefined') {
			return undefined;
		}

		return {
			...this.toObject(data),
			customFields: this.keyValueToObject(data, 'customFields'),
			phones: this.toPhones(data),
			addTags: this.toTags(data, 'addTags'),
			removeTags: this.toTags(data, 'removeTags'),
		};
	};

	private toOrderData(data: IDataObject[]): IDataObject | undefined {
		if (typeof data === 'undefined') {
			return undefined;
		}

		return {
			...this.toObject(data),
			customFields: this.keyValueToObject(data, 'customFields'),
			items: this.toItems(data),
			customer: this.keyValueToObject(data, 'customer'),
		};
	};

	private toPhones(data: IDataObject[]): IDataObject[] | undefined {
		const phonesEntry = data.find(item => item.key === 'phones') as IDataObject | undefined;
		if (phonesEntry?.phones && typeof phonesEntry.phones === 'object') {
			const resultPhones = (phonesEntry.phones as IDataObject).phones ?? phonesEntry.phones;
			return resultPhones as IDataObject[];
		}

		return undefined;
	};

	private toTags(data: IDataObject[], tagsAction: string): string[] | undefined {
		const entry = data.find(item => item.key === tagsAction) as IDataObject | undefined;
		const tags = entry?.[tagsAction];
		if (Array.isArray(tags)) {
			return tags as string[];
		}

		return undefined;
	};

	private toItems(data: IDataObject[]): IDataObject[] {
		const entry = data.find(item => item.key === 'items');
		if (!entry) {
			return [];
		}

		const items = entry.items as IDataObject;
		const itemCollection = (items?.itemCollection as IDataObject[]) || [];

		return itemCollection.map(item => this.normalizeItem(item));
	};

	private normalizeItem(item: IDataObject): IDataObject {
		const normalizedItem: IDataObject = {};
		const properties = item.properties as IDataObject;
		const propertiesArray = (properties?.property as IDataObject[]) || [];

		for (const property of propertiesArray) {
			const itemProperty = property.itemProperty as string | undefined;
			if (!itemProperty) continue;

			if (itemProperty === 'offer') {
				normalizedItem.offer = this.processOfferProperty(property);
			} else {
				normalizedItem[itemProperty] = property.value;
			}
		}

		return normalizedItem;
	};

	private processOfferProperty(property: IDataObject): { id: number } | null {
		const offer = property.offer as IDataObject;
		const byValue = offer?.byValue as IDataObject;
		const offerValue = byValue?.value;

		if (offerValue === undefined || offerValue === null) {
			return null;
		}

		const offerId = Number(offerValue);
		return isNaN(offerId) ? null : { id: offerId };
	};

	// common builders
	private buildList(ctx: IExecuteFunctions, i: number, filterParamName: string): { qs: IDataObject } {
		const filterInput = ctx.getNodeParameter(filterParamName, i) as IDataObject;
		let filter: IDataObject = {};
		if (typeof filterInput?.properties !== 'undefined') {
			const props = filterInput.properties as IDataObject[];
			filter = {
				...this.toObject(props),
				customFields: this.keyValueToObject(props, 'customFields'),
			};
		}
		return {
			qs: {
				filter,
				page: ctx.getNodeParameter('page', i) as number,
				limit: ctx.getNodeParameter('limit', i) as number,
			},
		};
	};

	private buildCreate(
		ctx: IExecuteFunctions,
		i: number,
		dataParamName: string,
		jsonFieldName: 'customer' | 'order',
		buildFn: (props: IDataObject[]) => IDataObject | undefined,
	): IDataObject {
		const data = ctx.getNodeParameter(dataParamName, i) as IDataObject;
		const formatted = buildFn(((data?.properties as IDataObject[]) || []));
		const body: IDataObject = {};

		if (typeof formatted !== 'undefined') {
			body[jsonFieldName] = JSON.stringify(formatted);
		}
		body.site = ctx.getNodeParameter('site', i) as string;

		return body;
	};

	private buildEdit(
		ctx: IExecuteFunctions,
		i: number,
		dataParamName: string,
		jsonFieldName: 'customer' | 'order',
		buildFn: (props: IDataObject[]) => IDataObject | undefined,
	): IDataObject {
		const data = ctx.getNodeParameter(dataParamName, i) as IDataObject;
		const formatted = buildFn(((data?.properties as IDataObject[]) || []));
		const body: IDataObject = { by: 'id' };

		if (typeof formatted !== 'undefined') {
			body[jsonFieldName] = JSON.stringify(formatted);
		}
		body.site = ctx.getNodeParameter('site', i) as string;

		return body;
	};

	// customer builders
	private buildCustomerGet(ctx: IExecuteFunctions, i: number): RequestConfig {
		const { qs } = this.buildList(ctx, i, 'getFilter');
		return { endpoint: '/customers', method: 'GET', qs };
	}

	private buildCustomerCreate(ctx: IExecuteFunctions, i: number): RequestConfig {
		return {
			endpoint: '/customers/create',
			method: 'POST',
			body: this.buildCreate(ctx, i, 'customerData', 'customer', this.toCustomerData.bind(this)),
		};
	}

	private buildCustomerEdit(ctx: IExecuteFunctions, i: number): RequestConfig {
		const id = ctx.getNodeParameter('id', i) as string;
		return {
			endpoint: `/customers/${id}/edit`,
			method: 'POST',
			body: this.buildEdit(ctx, i, 'customerData', 'customer', this.toCustomerData.bind(this)),
		};
	}

	// order builders
	private buildOrderGet(ctx: IExecuteFunctions, i: number): RequestConfig {
		const { qs } = this.buildList(ctx, i, 'getFilter');
		return { endpoint: '/orders', method: 'GET', qs };
	}

	private buildOrderCreate(ctx: IExecuteFunctions, i: number): RequestConfig {
		return {
			endpoint: '/orders/create',
			method: 'POST',
			body: this.buildCreate(ctx, i, 'orderData', 'order', this.toOrderData.bind(this)),
		};
	}

	private buildOrderEdit(ctx: IExecuteFunctions, i: number): RequestConfig {
		const id = ctx.getNodeParameter('id', i) as string;
		return {
			endpoint: `/orders/${id}/edit`,
			method: 'POST',
			body: this.buildEdit(ctx, i, 'orderData', 'order', this.toOrderData.bind(this)),
		};
	}

	// message builders
	private buildMessageSend(ctx: IExecuteFunctions, i: number): RequestConfig {
		const messageData = ctx.getNodeParameter('messageData', i) as IDataObject;
		const props = (messageData?.properties || {}) as IDataObject;
		return {
			endpoint: '/message',
			method: 'POST',
			body: {
				chatId: ctx.getNodeParameter('chatId', i) as string,
				scope: (props.scope as string) ?? 'public',
				content: (props.content as string) ?? '',
			},
		};
	}

	// dialog builders
	private buildDialogAssign(ctx: IExecuteFunctions, i: number): RequestConfig {
		const dialogId = ctx.getNodeParameter('dialogId', i) as string;
		const dialogData = ctx.getNodeParameter('dialogData', i) as IDataObject;
		const props = (dialogData?.properties || {}) as IDataObject;
		const key = props.key as string;
		return {
			endpoint: `/dialogs/${dialogId}/assign`,
			method: 'PATCH',
			body: { [key]: (props.value as number) },
		};
	}

	private buildDialogUnassign(ctx: IExecuteFunctions, i: number): RequestConfig {
		const dialogId = ctx.getNodeParameter('dialogId', i) as string;
		return { endpoint: `/dialogs/${dialogId}/unassign`, method: 'PATCH' };
	}

	private buildDialogClose(ctx: IExecuteFunctions, i: number): RequestConfig {
		const dialogId = ctx.getNodeParameter('dialogId', i) as string;
		return { endpoint: `/dialogs/${dialogId}/close`, method: 'DELETE' };
	}
}

export const simlaApiRequestBuilder = new SimlaApiRequestBuilder();
