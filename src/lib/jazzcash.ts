import { createHmac } from 'crypto';

// Lazy env getters — never throw at module load.
function getMerchantId(): string | undefined {
  return process.env.JAZZCASH_MERCHANT_ID || undefined;
}
function getPassword(): string | undefined {
  return process.env.JAZZCASH_PASSWORD || undefined;
}
function getIntegritySalt(): string | undefined {
  return process.env.JAZZCASH_INTEGRITY_SALT || undefined;
}

export function isJazzCashConfigured(): boolean {
  return Boolean(getMerchantId() && getPassword() && getIntegritySalt());
}

const SANDBOX_URL =
  'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/';

// Format YYYYMMDDHHMMSS in local server time. JazzCash expects PKT, but for
// stub purposes ISO-like compact format works for signing/integrity tests.
function formatDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

function computeSecureHash(params: Record<string, string>, salt: string): string {
  // Per JazzCash spec: concatenate values of all pp_* fields sorted by key,
  // joined with '&', then HMAC-SHA256 with integrity salt as key.
  const keys = Object.keys(params)
    .filter((k) => k.startsWith('pp_') && k !== 'pp_SecureHash' && params[k] !== '' && params[k] != null)
    .sort();
  const data = keys.map((k) => params[k]).join('&');
  return createHmac('sha256', salt).update(data).digest('hex').toUpperCase();
}

export interface BuildJazzCashPayloadInput {
  amount: number;       // PKR
  orderId: string;      // pp_TxnRefNo (our reference)
  billRef: string;      // pp_BillReference (payment record id)
  description: string;  // pp_TxnDescription
  returnUrl: string;    // pp_ReturnURL
}

export function buildJazzCashPayload(input: BuildJazzCashPayloadInput): {
  redirectUrl: string;
  params: Record<string, string>;
} {
  const merchantId = getMerchantId();
  const password = getPassword();
  const salt = getIntegritySalt();

  if (!merchantId || !password || !salt) {
    throw new Error('JazzCash is not configured');
  }

  const now = new Date();
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Amount is in lowest currency unit (paisa) — multiply by 100.
  const amountStr = Math.round(input.amount * 100).toString();

  const params: Record<string, string> = {
    pp_Version: '1.1',
    pp_TxnType: 'MWALLET',
    pp_Language: 'EN',
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_BankID: 'TBANK',
    pp_ProductID: 'RETL',
    pp_TxnRefNo: input.orderId,
    pp_Amount: amountStr,
    pp_TxnCurrency: 'PKR',
    pp_TxnDateTime: formatDateTime(now),
    pp_BillReference: input.billRef,
    pp_Description: input.description,
    pp_TxnExpiryDateTime: formatDateTime(expiry),
    pp_ReturnURL: input.returnUrl,
    ppmpf_1: '',
    ppmpf_2: '',
    ppmpf_3: '',
    ppmpf_4: '',
    ppmpf_5: '',
  };

  params.pp_SecureHash = computeSecureHash(params, salt);

  return { redirectUrl: SANDBOX_URL, params };
}

export function verifyJazzCashCallback(params: Record<string, string>): boolean {
  const salt = getIntegritySalt();
  if (!salt) return false;
  const provided = params.pp_SecureHash;
  if (!provided) return false;
  const expected = computeSecureHash(params, salt);
  return expected === provided.toUpperCase();
}
