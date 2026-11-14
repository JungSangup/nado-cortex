import { describe, it, expect, beforeEach } from 'vitest';
import { PacketFramer } from '../src/bluetooth/PacketFramer';

describe('PacketFramer', () => {
  let framer: PacketFramer;

  beforeEach(() => {
    framer = new PacketFramer();
  });

  it('should encode and decode a single complete packet frame', () => {
    const messageType = 0x00000004; // e.g. Parameter change
    const payload = new Uint8Array([0x08, 0x01, 0x12, 0x04, 0x47, 0x61, 0x69, 0x6E]); // Sample protobuf bytes

    const encoded = framer.encode(messageType, payload);
    expect(encoded).toBeInstanceOf(Uint8Array);

    const packets = framer.pushChunk(encoded);
    expect(packets).toHaveLength(1);
    expect(packets[0].messageType).toBe(messageType);
    expect(Array.from(packets[0].payload)).toEqual(Array.from(payload));
  });

  it('should reassemble packets split across multiple chunks', () => {
    const messageType = 0x00000010;
    const payload = new Uint8Array(60).fill(0xAA); // 60-byte payload

    const encoded = framer.encode(messageType, payload);
    
    // Split into 3 small chunks (e.g. simulating BLE MTU fragmentations)
    const chunk1 = encoded.slice(0, 20);
    const chunk2 = encoded.slice(20, 45);
    const chunk3 = encoded.slice(45);

    expect(framer.pushChunk(chunk1)).toHaveLength(0); // Not complete yet
    expect(framer.pushChunk(chunk2)).toHaveLength(0); // Still incomplete
    
    const packets = framer.pushChunk(chunk3); // Final chunk
    expect(packets).toHaveLength(1);
    expect(packets[0].messageType).toBe(messageType);
    expect(packets[0].payload.length).toBe(60);
    expect(packets[0].payload[0]).toBe(0xAA);
  });

  it('should handle back-to-back multiple packets in a single chunk', () => {
    const msg1 = framer.encode(0x01, new Uint8Array([1, 2, 3]));
    const msg2 = framer.encode(0x02, new Uint8Array([4, 5, 6]));

    const combined = new Uint8Array(msg1.length + msg2.length);
    combined.set(msg1, 0);
    combined.set(msg2, msg1.length);

    const packets = framer.pushChunk(combined);
    expect(packets).toHaveLength(2);
    expect(packets[0].messageType).toBe(0x01);
    expect(Array.from(packets[0].payload)).toEqual([1, 2, 3]);
    expect(packets[1].messageType).toBe(0x02);
    expect(Array.from(packets[1].payload)).toEqual([4, 5, 6]);
  });
});
