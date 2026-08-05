// ===========================
// Utility Functions
// ===========================

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";

    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes.buffer;
}


// ===========================
// Password Hashing
// ===========================

async function hashPassword(password) {
    const encoder = new TextEncoder();

    return await crypto.subtle.digest(
        "SHA-256",
        encoder.encode(password)
    );
}


// ===========================
// AES Key Generation
// ===========================

async function passwordToKey(password) {

    const hash = await hashPassword(password);

    return await crypto.subtle.importKey(
        "raw",
        hash,
        {
            name: "AES-GCM"
        },
        false,
        ["encrypt", "decrypt"]
    );

}


// ===========================
// Encrypt Message
// ===========================

async function encryptMessage(password, message) {

    const key = await passwordToKey(password);

    // AES-GCM uses a 12-byte IV
    const iv = crypto.getRandomValues(
        new Uint8Array(12)
    );

    const encoder = new TextEncoder();

    const ciphertext = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encoder.encode(message)
    );

    return {
        ciphertext: arrayBufferToBase64(ciphertext),
        iv: arrayBufferToBase64(iv)
    };

}


// ===========================
// Decrypt Message
// ===========================

async function decryptMessage(password, ciphertext, iv) {

    const key = await passwordToKey(password);

    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: new Uint8Array(base64ToArrayBuffer(iv))
        },
        key,
        base64ToArrayBuffer(ciphertext)
    );

    return new TextDecoder().decode(decrypted);

}