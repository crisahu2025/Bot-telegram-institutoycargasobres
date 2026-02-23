import { google } from 'googleapis';

export async function getGoogleSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
}

export const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '19YwVcGBZmTPkx-RHq-XoYKacuHliYa_tsCiN7Zc9b9M';
