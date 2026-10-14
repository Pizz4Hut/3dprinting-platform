import QRCode from 'qrcode';

/**
 * Computes CRC16-CCITT checksum for EMVCo QR Code standard
 */
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Format string as EMVCo tag-length-value (TLV)
 */
function formatTlv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

/**
 * Generate EMVCo PromptPay Payload
 * Target: Phone number (08x, 09x) or National ID (13 digits)
 */
export function generatePromptPayPayload(target: string, amount?: number): string {
  const sanitized = target.replace(/[^0-9]/g, '');

  let formattedTarget = '';
  if (sanitized.length === 10 && sanitized.startsWith('0')) {
    // Phone number: prefix with 0066 + 9 digits
    formattedTarget = '0066' + sanitized.substring(1);
    formattedTarget = formatTlv('01', formattedTarget);
  } else if (sanitized.length === 13) {
    // National ID / Tax ID
    formattedTarget = formatTlv('02', sanitized);
  } else {
    // Fallback as phone or ID
    formattedTarget = formatTlv('01', sanitized);
  }

  // 00: Version '01'
  // 01: Initiation method (11: Static, 12: Dynamic)
  const isDynamic = amount !== undefined && amount > 0;
  const initiationMethod = isDynamic ? '12' : '11';

  // 29: PromptPay AID tag
  const aid = formatTlv('00', 'A000000677010111');
  const tag29 = formatTlv('29', aid + formattedTarget);

  let raw =
    formatTlv('00', '01') +
    formatTlv('01', initiationMethod) +
    tag29 +
    formatTlv('53', '764') + // THB currency code
    formatTlv('58', 'TH'); // Country code TH

  if (amount !== undefined && amount > 0) {
    const formattedAmount = amount.toFixed(2);
    raw += formatTlv('54', formattedAmount);
  }

  // 63: Checksum tag placeholder
  raw += '6304';
  const checksum = crc16(raw);

  return raw + checksum;
}

/**
 * Generates Base64 Data URL for PromptPay QR Code
 */
export async function generatePromptPayQR(target: string, amount?: number): Promise<string> {
  const payload = generatePromptPayPayload(target, amount);
  return await QRCode.toDataURL(payload, {
    width: 380,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
}
