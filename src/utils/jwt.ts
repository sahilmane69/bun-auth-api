// src/utils/jwt.ts
function base64url(input: Uint8Array) {
    // base64 -> url-safe
    const b64 = Buffer.from(input).toString("base64");
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function encode(obj: object) {
    return base64url(Buffer.from(JSON.stringify(obj)));
}

async function hmacSha256(secret: string, msg: string) {
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
    return new Uint8Array(sig);
}

export async function sign(payload: object, secret: string, opts?: { expSec?: number }) {
    const header = { alg: "HS256", typ: "JWT" };
    const iat = Math.floor(Date.now() / 1000);
    const payloadWithMeta: any = { ...payload, iat };
    if (opts?.expSec) payloadWithMeta.exp = iat + opts.expSec;
    const headerEnc = encode(header);
    const payloadEnc = encode(payloadWithMeta);
    const toSign = `${headerEnc}.${payloadEnc}`;
    const sig = await hmacSha256(secret, toSign);
    const sigEnc = base64url(sig);
    return `${toSign}.${sigEnc}`;
}

export async function verify(token: string, secret: string) {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const headerEnc = parts[0];
        const payloadEnc = parts[1];
        const sigEnc = parts[2];

        if (!headerEnc || !payloadEnc || !sigEnc) return null;

        const toSign = `${headerEnc}.${payloadEnc}`;
        const expectedSig = await hmacSha256(secret, toSign);
        const expectedEnc = base64url(expectedSig);
        if (expectedEnc !== sigEnc) return null;
        const payloadJson = Buffer.from(payloadEnc.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
        const payload = JSON.parse(payloadJson);
        if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
        return payload;
    } catch {
        return null;
    }
}
