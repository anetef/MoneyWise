/**
 * Gera um UUID v4 para a transação.
 *
 * A API exige que o ID venha do app: assim, se a mesma transação
 * for enviada duas vezes (ex.: internet caiu no meio), ela não duplica.
 * Usa o gerador seguro do aparelho quando existe; senão, Math.random.
 */
export function createId(): string {
    const cryptoApi = (globalThis as { crypto?: Crypto }).crypto;

    if (cryptoApi?.randomUUID) {
        return cryptoApi.randomUUID();
    }

    const bytes = new Uint8Array(16);

    if (cryptoApi?.getRandomValues) {
        cryptoApi.getRandomValues(bytes);
    } else {
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
    }

    // Marca a versão (4) e a variante, como manda o padrão UUID.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20),
    ].join('-');
}
