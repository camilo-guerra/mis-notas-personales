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
        return new Promise((resolve, reject) => {
            this.tokenClient.callback = (response) => {
                if (response.error) {
                    reject(response);
                    return;
                }
                this.accessToken = response.access_token;
                resolve(this.accessToken);
            };
            // Usar prompt: '' para intentar refrescar sin forzar consentimiento si ya se dio
            this.tokenClient.requestAccessToken({ prompt: '' });
        });
    }

    async callDriveApi(url, options = {}, ignoreAuthErrors = false) {
        if (!this.accessToken) {
            await this.getAccessToken();
        }

        const headers = {
            ...options.headers,
            Authorization: `Bearer ${this.accessToken}`
        };

        let response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            if (ignoreAuthErrors) {
                throw new Error('AUTH_REQUIRED');
            }
            // Token expirado, intentar obtener uno nuevo
            await this.getAccessToken();
            headers.Authorization = `Bearer ${this.accessToken}`;
            response = await fetch(url, { ...options, headers });
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Error en la petición a Drive');
        }

        return response;
    }

    async findOrCreateFolder(folderName, parentId = null) {
        let q = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        if (parentId) {
            q += ` and '${parentId}' in parents`;
        }

        const response = await this.callDriveApi(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}`);
        const data = await response.json();

        if (data.files && data.files.length > 0) {
            return data.files[0].id;
        }

        // Create folder
        const body = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
        };
        if (parentId) {
            body.parents = [parentId];
        }

        const createResponse = await this.callDriveApi('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const folder = await createResponse.json();
        return folder.id;
    }

    async uploadFile(folderId, fileName, fileBlob, mimeType) {
        const metadata = {
            name: fileName,
            parents: [folderId],
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', fileBlob);

        const response = await this.callDriveApi('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            body: form,
        });
        return await response.json();
    }

    async getFile(fileId) {
        const response = await this.callDriveApi(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
        return await response.blob();
    }

    async listFiles(folderId) {
        const q = `'${folderId}' in parents and trashed = false`;
        const response = await this.callDriveApi(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id, name, mimeType)`);
        const data = await response.json();
        return data.files || [];
    }

    async updateJsonFile(fileId, content, isSilent = false) {
        const response = await this.callDriveApi(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(content),
        }, isSilent);
        return await response.json();
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

        const response = await this.callDriveApi('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            body: form,
        });
        return await response.json();
    }

    async deleteFile(fileId) {
        return await this.callDriveApi(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            method: 'DELETE'
        });
    }
}
