import { Client, type StompSubscription } from '@stomp/stompjs';

import { refreshTokens } from '../api/apiClient';
import { sessionStore } from '../storage/sessionStore';

/**
 * Tempo real da API (WebSocket + STOMP), usado pelo Termômetro (RF-19).
 *
 * - Conecta em `/ws` mandando `Authorization: Bearer <token>` no
 *   handshake: é assim que o backend sabe quem está conectando.
 * - Cada tela assina um tópico e recebe uma função para cancelar.
 * - Só fica conectado enquanto alguma tela estiver inscrita.
 * - Se a conexão cair, tenta de novo sozinho a cada 5 segundos.
 */

type MessageHandler = (body: unknown) => void;

// Tempo entre tentativas de reconexão.
const RECONNECT_DELAY_MS = 5000;

/**
 * Endereço do WebSocket, montado a partir do endereço da API:
 * http://192.168.0.10:8080/api/v1 → ws://192.168.0.10:8080/ws
 * (o /ws fica fora do prefixo /api/v1 no backend).
 */
function realtimeUrl(): string | null {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;

    if (!apiUrl) {
        return null;
    }

    const origin = apiUrl
        .replace(/\/+$/, '')
        .replace(/\/api\/v\d+$/, '')
        .replace(/^http/, 'ws');

    return `${origin}/ws`;
}

// Tópicos assinados pelas telas: tópico → (id da inscrição → função).
const handlers = new Map<string, Map<number, MessageHandler>>();
// Inscrições ativas no servidor, uma por tópico.
const stompSubscriptions = new Map<string, StompSubscription>();

let client: Client | null = null;
let nextHandlerId = 1;
// A última tentativa foi recusada antes de conectar (token vencido?).
let shouldRefreshToken = false;
let connectedThisAttempt = false;

function deliver(topic: string, rawBody: string) {
    let body: unknown;

    try {
        body = JSON.parse(rawBody);
    } catch {
        return;
    }

    handlers.get(topic)?.forEach((handler) => handler(body));
}

/** Assina o tópico no servidor (se ainda não estiver assinado). */
function subscribeOnServer(topic: string) {
    if (!client?.connected || stompSubscriptions.has(topic)) {
        return;
    }

    const subscription = client.subscribe(topic, (message) => deliver(topic, message.body));
    stompSubscriptions.set(topic, subscription);
}

function createClient(url: string): Client {
    const stomp = new Client({
        reconnectDelay: RECONNECT_DELAY_MS,

        // Correções conhecidas do WebSocket do React Native com STOMP.
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,

        // Antes de cada tentativa: pega o token atual (renovando se a
        // tentativa anterior foi recusada) e prepara o WebSocket com ele.
        beforeConnect: async (self) => {
            if (shouldRefreshToken) {
                shouldRefreshToken = false;
                await refreshTokens();
            }

            const token = await sessionStore.getAccessToken();

            if (!token) {
                // Sem sessão: para de tentar até alguma tela assinar de novo.
                await self.deactivate();
                return;
            }

            connectedThisAttempt = false;

            self.webSocketFactory = () =>
                // O WebSocket do React Native aceita cabeçalhos no 3º parâmetro.
                new (WebSocket as unknown as new (
                    url: string,
                    protocols: string[],
                    options: { headers: Record<string, string> },
                ) => WebSocket)(url, ['v12.stomp'], {
                    headers: { Authorization: `Bearer ${token}` },
                });
        },

        onConnect: () => {
            connectedThisAttempt = true;
            // Conexão nova: as inscrições antigas não valem mais.
            stompSubscriptions.clear();
            handlers.forEach((_, topic) => subscribeOnServer(topic));
        },

        onWebSocketClose: () => {
            stompSubscriptions.clear();

            // Fechou antes de conectar: provavelmente o token venceu (401).
            if (!connectedThisAttempt) {
                shouldRefreshToken = true;
            }
        },

        onStompError: (frame) => {
            // Ex.: inscrição recusada (não é membro do grupo da Caixinha).
            console.warn('[tempo real] erro do servidor:', frame.headers.message);
        },
    });

    return stomp;
}

/**
 * Recebe as mensagens de um tópico enquanto a função devolvida não
 * for chamada. Use dentro de um `useEffect` e chame-a no cleanup.
 */
export function subscribeToTopic(topic: string, onMessage: MessageHandler): () => void {
    const url = realtimeUrl();

    // Sem endereço configurado, a tela segue funcionando sem tempo real.
    if (!url) {
        return () => {};
    }

    const handlerId = nextHandlerId++;
    const topicHandlers = handlers.get(topic) ?? new Map<number, MessageHandler>();
    topicHandlers.set(handlerId, onMessage);
    handlers.set(topic, topicHandlers);

    if (!client) {
        client = createClient(url);
    }

    if (!client.active) {
        client.activate();
    } else {
        subscribeOnServer(topic);
    }

    return () => {
        const current = handlers.get(topic);
        current?.delete(handlerId);

        if (current && current.size === 0) {
            handlers.delete(topic);

            try {
                stompSubscriptions.get(topic)?.unsubscribe();
            } catch {
                // Já desconectado: não há o que cancelar no servidor.
            }

            stompSubscriptions.delete(topic);
        }

        // Ninguém mais ouvindo: fecha a conexão para poupar bateria.
        if (handlers.size === 0 && client) {
            client.deactivate();
        }
    };
}
