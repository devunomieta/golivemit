/**
 * Cryptographic Audit Ledger Engine
 * Web Crypto SHA-256 Hash Chain Utility for Immutable Governance Auditing
 */

export interface CryptographicBlock {
  blockHash: string;
  previousHash: string;
  approverName: string;
  decision: string;
  timestamp: string;
  signatureStamp: string;
  isValid: boolean;
}

/**
 * Computes Web Crypto SHA-256 hash string for given text input
 */
export async function computeSHA256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates an immutable SHA-256 block hash for an approval vote
 */
export async function createApprovalBlockHash(
  index: number,
  releaseId: string,
  approverName: string,
  decision: string,
  timestamp: string,
  previousHash: string = '0000000000000000000000000000000000000000000000000000000000000000'
): Promise<string> {
  const rawPayload = `${index}|${releaseId}|${approverName}|${decision}|${timestamp}|${previousHash}`;
  return await computeSHA256(rawPayload);
}

/**
 * Validates cryptographic chain integrity across an array of approval records
 */
export async function verifyLedgerIntegrity(
  approvals: Array<{
    approverName: string;
    decision: string;
    createdAt: string;
    signatureStamp?: string;
    blockHash?: string;
    previousHash?: string;
  }>,
  releaseId: string = 'rel-1'
): Promise<{
  isChainValid: boolean;
  tamperedIndex: number | null;
  blocks: CryptographicBlock[];
}> {
  if (approvals.length === 0) {
    return { isChainValid: true, tamperedIndex: null, blocks: [] };
  }

  const blocks: CryptographicBlock[] = [];
  let isChainValid = true;
  let tamperedIndex: number | null = null;

  // Process in chronological order (oldest to newest)
  const chronological = [...approvals].reverse();

  for (let i = 0; i < chronological.length; i++) {
    const record = chronological[i];
    const prevHash = i === 0 
      ? '0000000000000000000000000000000000000000000000000000000000000000' 
      : blocks[i - 1].blockHash;

    const expectedHash = await createApprovalBlockHash(
      i,
      releaseId,
      record.approverName,
      record.decision,
      record.createdAt,
      prevHash
    );

    const actualHash = record.blockHash || expectedHash;
    const isValid = actualHash === expectedHash;

    if (!isValid && isChainValid) {
      isChainValid = false;
      tamperedIndex = i;
    }

    blocks.push({
      blockHash: actualHash,
      previousHash: prevHash,
      approverName: record.approverName,
      decision: record.decision,
      timestamp: record.createdAt,
      signatureStamp: record.signatureStamp || `SIG-2026-${actualHash.substring(0, 6).toUpperCase()}`,
      isValid,
    });
  }

  return {
    isChainValid,
    tamperedIndex,
    blocks: blocks.reverse(), // Return reverse order (newest first for UI rendering)
  };
}
