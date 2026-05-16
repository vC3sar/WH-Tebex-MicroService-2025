const fs = require('fs');
const path = require('path');

const storeDir = path.join(process.cwd(), '.data');
const storePath = path.join(storeDir, 'tebex-idempotency.json');
const retentionMs = 1000 * 60 * 60 * 24 * 30;

let cache = loadStore();

function loadStore() {
  try {
    if (!fs.existsSync(storePath)) {
      return new Map();
    }

    const content = fs.readFileSync(storePath, 'utf8');
    const parsed = JSON.parse(content);
    const entries = Object.entries(parsed)
      .filter(([, timestamp]) => Date.now() - Number(timestamp) <= retentionMs)
      .map(([eventId, timestamp]) => [eventId, Number(timestamp)]);

    return new Map(entries);
  } catch {
    return new Map();
  }
}

function persistStore() {
  fs.mkdirSync(storeDir, { recursive: true });

  const serializable = Object.fromEntries(cache.entries());
  fs.writeFileSync(storePath, JSON.stringify(serializable, null, 2), 'utf8');
}

function normalizeEventId(value) {
  return String(value || '').trim();
}

function getWebhookEventId(payload) {
  const candidates = [
    payload?.subject?.transaction_id,
    payload?.subject?.transactionId,
    payload?.subject?.order_id,
    payload?.subject?.orderId,
    payload?.subject?.id,
    payload?.transaction_id,
    payload?.transactionId,
    payload?.order_id,
    payload?.orderId,
    payload?.id,
  ];

  for (const candidate of candidates) {
    const eventId = normalizeEventId(candidate);
    if (eventId) {
      return eventId;
    }
  }

  return null;
}

function isDuplicateEvent(eventId) {
  const normalizedEventId = normalizeEventId(eventId);

  if (!normalizedEventId) {
    return false;
  }

  return cache.has(normalizedEventId);
}

function claimEvent(eventId) {
  const normalizedEventId = normalizeEventId(eventId);

  if (!normalizedEventId) {
    return false;
  }

  const alreadyExists = cache.has(normalizedEventId);
  if (alreadyExists) {
    return false;
  }

  cache.set(normalizedEventId, Date.now());
  persistStore();
  return true;
}

function pruneStore() {
  const cutoff = Date.now() - retentionMs;
  let changed = false;

  for (const [eventId, timestamp] of cache.entries()) {
    if (Number(timestamp) < cutoff) {
      cache.delete(eventId);
      changed = true;
    }
  }

  if (changed) {
    persistStore();
  }
}

module.exports = {
  getWebhookEventId,
  isDuplicateEvent,
  claimEvent,
  pruneStore,
};
