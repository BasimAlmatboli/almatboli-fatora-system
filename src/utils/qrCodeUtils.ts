import { Invoice } from '../types/Invoice';

/**
 * Encodes a value using TLV (Tag-Length-Value) format for ZATCA QR code
 * @param tag - The tag identifier (1-5)
 * @param value - The string value to encode
 * @returns Uint8Array containing the TLV encoded data
 */
function encodeTLV(tag: number, value: string): Uint8Array {
  // Convert string to UTF-8 bytes
  const encoder = new TextEncoder();
  const valueBytes = encoder.encode(value);

  // Get the length of the value in bytes
  const length = valueBytes.length;

  // Create TLV structure: [tag][length][value]
  const tlvArray = new Uint8Array(2 + length);
  tlvArray[0] = tag;        // Tag (1 byte)
  tlvArray[1] = length;     // Length (1 byte)
  tlvArray.set(valueBytes, 2); // Value (variable length)

  return tlvArray;
}

/**
 * Generates ZATCA-compliant QR code string for simplified tax invoice
 * @param invoice - The invoice object containing all necessary data
 * @returns Base64 encoded string for QR code generation
 */
export function generateZatcaQrCode(invoice: Invoice): string {
  // Extract the 5 required fields according to ZATCA regulations

  // 1. Seller Name (Tag: 0x01)
  const sellerName = invoice.company?.name || 'Unknown Seller';

  // 2. Seller VAT Registration Number (Tag: 0x02)
  const vatRegistrationNumber = invoice.company?.taxNumber || '000000000000000';

  // 3. Invoice Date and Time in ISO 8601 format (Tag: 0x03)
  // Convert date to proper ISO format with time
  let invoiceDateTime = new Date().toISOString();
  try {
    if (invoice.date) {
      const date = new Date(invoice.date + 'T00:00:00.000Z');
      if (!isNaN(date.getTime())) {
        invoiceDateTime = date.toISOString();
      }
    }
  } catch (e) {
    console.warn('Invalid invoice date, using current time', e);
  }

  // 4. Total VAT Amount (Tag: 0x04)
  const totalVatAmount = (invoice.taxAmount || 0).toFixed(2);

  // 5. Total Invoice Amount with VAT (Tag: 0x05)
  const totalInvoiceAmount = (invoice.total || 0).toFixed(2);

  // Encode each field using TLV format
  const tlv1 = encodeTLV(0x01, sellerName);
  const tlv2 = encodeTLV(0x02, vatRegistrationNumber);
  const tlv3 = encodeTLV(0x03, invoiceDateTime);
  const tlv4 = encodeTLV(0x04, totalVatAmount);
  const tlv5 = encodeTLV(0x05, totalInvoiceAmount);

  // Calculate total length for the combined array
  const totalLength = tlv1.length + tlv2.length + tlv3.length + tlv4.length + tlv5.length;

  // Combine all TLV encoded data into a single Uint8Array
  const combinedTlvData = new Uint8Array(totalLength);
  let offset = 0;

  combinedTlvData.set(tlv1, offset);
  offset += tlv1.length;

  combinedTlvData.set(tlv2, offset);
  offset += tlv2.length;

  combinedTlvData.set(tlv3, offset);
  offset += tlv3.length;

  combinedTlvData.set(tlv4, offset);
  offset += tlv4.length;

  combinedTlvData.set(tlv5, offset);

  // Convert the combined byte array to Base64 string
  const base64String = btoa(String.fromCharCode(...combinedTlvData));

  return base64String;
}