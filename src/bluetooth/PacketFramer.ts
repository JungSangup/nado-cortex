export interface FramedPacket {
  messageType: number;
  payload: Uint8Array;
  raw: Uint8Array;
}

/**
 * Nano Cortex BLE Packet Framer
 * 
 * Frame Format:
 * [Total Length (VarInt/Byte)] + [0xC0 (Delimiter)] + [Protobuf Payload] + [Message Type (32-bit LE, 4 bytes)]
 */
export class PacketFramer {
  public static readonly DELIMITER = 0xC0;
  private receiveBuffer: number[] = [];

  /**
   * Encodes a message type and payload into a formatted BLE packet frame.
   */
  public encode(messageType: number, payload: Uint8Array): Uint8Array {
    const typeBytes = new Uint8Array(4);
    const view = new DataView(typeBytes.buffer);
    view.setUint32(0, messageType, true); // Little-endian 32-bit

    // Payload + 4 bytes messageType
    const contentLen = payload.length + 4;
    
    // Length prefix (Variable Byte / Single Byte if < 128)
    const lenBytes: number[] = [];
    let rem = contentLen;
    while (rem >= 0x80) {
      lenBytes.push((rem & 0x7F) | 0x80);
      rem >>>= 7;
    }
    lenBytes.push(rem);

    const totalLength = lenBytes.length + 1 + payload.length + 4;
    const packet = new Uint8Array(totalLength);
    
    let offset = 0;
    packet.set(lenBytes, offset);
    offset += lenBytes.length;

    packet[offset++] = PacketFramer.DELIMITER;
    packet.set(payload, offset);
    offset += payload.length;

    packet.set(typeBytes, offset);

    return packet;
  }

  /**
   * Pushes incoming BLE chunks to internal buffer and parses all complete frames.
   */
  public pushChunk(chunk: Uint8Array): FramedPacket[] {
    for (let i = 0; i < chunk.length; i++) {
      this.receiveBuffer.push(chunk[i]);
    }

    const completedPackets: FramedPacket[] = [];

    while (this.receiveBuffer.length > 0) {
      // Look for the 0xC0 delimiter
      const delimiterIndex = this.receiveBuffer.indexOf(PacketFramer.DELIMITER);
      if (delimiterIndex === -1) {
        // No delimiter yet, keep buffering (unless buffer is abnormally large)
        if (this.receiveBuffer.length > 4096) {
          this.receiveBuffer = [];
        }
        break;
      }

      // Parse length from bytes before delimiter
      let contentLen = 0;
      let multiplier = 1;
      let validLength = true;

      for (let i = 0; i < delimiterIndex; i++) {
        const b = this.receiveBuffer[i];
        contentLen += (b & 0x7F) * multiplier;
        multiplier *= 128;
        if ((b & 0x80) === 0) {
          break;
        }
      }

      if (!validLength || contentLen < 4) {
        // Discard invalid leading bytes up to delimiter
        this.receiveBuffer.splice(0, delimiterIndex + 1);
        continue;
      }

      const packetStart = 0;
      const payloadStart = delimiterIndex + 1;
      const packetTotalLen = payloadStart + contentLen;

      if (this.receiveBuffer.length < packetTotalLen) {
        // Incomplete packet; wait for more chunks
        break;
      }

      // Extract raw packet
      const raw = new Uint8Array(this.receiveBuffer.slice(packetStart, packetTotalLen));
      
      // Extract payload and message type
      const payloadEnd = packetTotalLen - 4;
      const payload = new Uint8Array(this.receiveBuffer.slice(payloadStart, payloadEnd));
      
      const typeBytes = new Uint8Array(this.receiveBuffer.slice(payloadEnd, packetTotalLen));
      const typeView = new DataView(typeBytes.buffer);
      const messageType = typeView.getUint32(0, true);

      completedPackets.push({
        messageType,
        payload,
        raw,
      });

      // Remove consumed bytes from buffer
      this.receiveBuffer.splice(0, packetTotalLen);
    }

    return completedPackets;
  }

  /**
   * Clears the internal receive buffer.
   */
  public reset(): void {
    this.receiveBuffer = [];
  }
}
