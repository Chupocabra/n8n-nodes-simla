import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SimlaApi implements ICredentialType {
	name = 'simlaApi';
	displayName = 'Simla Integration API';
	documentationUrl = 'https://docs.simla.com/Developers';
	icon = 'file:simla.svg' as const;

	httpRequestNode = {
		name: 'Simla API',
		docsUrl: 'https://docs.simla.com/Developers/API/APIVersions/APIv5',
		apiBaseUrlPlaceholder: 'https://example.simla.com/api/v5',
	};

	properties: INodeProperties[] = [
		{
			displayName: 'Simla Url',
			name: 'apiUrl',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Simla API key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-Api-Key': '={{$credentials.apiKey}}'
			}
		},
	};

	test: ICredentialTestRequest = {
		request: {
			method: 'GET',
			baseURL: '={{$credentials.apiUrl.replace(/\\/$/, "")}}/api',
			url: '/system-info',
			json: true,
		},
	};
}
