const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';
const SECRET_KEY = "Horeb2025";

export async function callBridge(command: string, payload: any = {}) {
    if (!GOOGLE_SCRIPT_URL) {
        console.error("GOOGLE_SCRIPT_URL is not set");
        return { status: "error", message: "GOOGLE_SCRIPT_URL missing" };
    }

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({
                key: SECRET_KEY,
                command,
                payload
            })
        });
        return await response.json();
    } catch (error) {
        console.error("Error calling bridge:", error);
        return { status: "error", message: String(error) };
    }
}
