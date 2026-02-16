/**
 * Google Drive API Service
 */

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

export class GoogleDriveService {
    constructor(clientId) {
        this.clientId = clientId;
        this.tokenClient = null;
        this.accessToken = null;
    }

    initGsi() {
        if (!window.google) {
            throw new Error('Google Identity Services script not loaded');
        }

        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: this.clientId,
            scope: SCOPES,
            callback: '', // Se definirá dinámicamente en requestAccessToken
        });
    }

    async getAccessToken() {
        return new Promise((resolve) => {
            this.tokenClient.callback = (response) => {
                this.accessToken = response.access_token;
                resolve(this.accessToken);
            };
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        });
    }

    async findOrCreateFolder(folderName) {
        const q = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}`, {
            headers: { Authorization: `Bearer ${this.accessToken}` }
        });
        const data = await response.json();

        if (data.files && data.files.length > 0) {
            return data.files[0].id;
        }

        // Create folder
        const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
            }),
        });
        const folder = await createResponse.json();
        return folder.id;
    }

    async createJsonFile(folderId, fileName, content) {
        const metadata = {
            name: fileName,
            parents: [folderId],
            mimeType: 'application/json',
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([JSON.stringify(content)], { type: 'application/json' }));

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.accessToken}` },
            body: form,
        });
        return await response.json();
    }
}
