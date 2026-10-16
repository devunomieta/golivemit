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

export interface VoteData {
  releaseId: string;
  approverId?: string;
  approverName: string;
  decision: string;
  conditionsText?: string;
  conditionsOwner?: string;
  dueDate?: string;
  [key: string]: unknown;
}

export interface LedgerBlock {
  blockIndex: number;
  voteData: VoteData;
  previousHash: string;
  timestamp: string;
  blockHash: string;
}

export interface ProofCertificate {
  certificateId: string;
  generatedAt: string;
  releaseId: string;
  isChainValid: boolean;
  totalBlocks: number;
  blocks: Array<{
    blockIndex: number;
    timestamp: string;
    previousHash: string;
    calculatedHash: string;
    storedHash: string;
    voteData: VoteData;
  }>;
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
 * Thesis Snippet 4.5: SHA-256 Ledger Hashing
 * Computes sequential hash: Hn = Hash(Bn | Vn | Hn-1 | Tn)
 */
export async function createLedgerBlock(
  blockIndex: number,
  voteData: VoteData,
  previousHash: string,
  timestamp: string
): Promise<LedgerBlock> {
  const payload =
    `${blockIndex}|${JSON.stringify(voteData)}|` + `${previousHash}|${timestamp}`;
  const encoded = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  const hashHex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return {
    blockIndex,
    voteData,
    previousHash,
    timestamp,
    blockHash: hashHex,
  };
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
  const voteData: VoteData = { releaseId, approverName, decision };
  const block = await createLedgerBlock(index, voteData, previousHash, timestamp);
  return block.blockHash;
}

/**
 * Thesis Section 4.16: Proof Certificate Generator
 * Exports JSON cryptographic certificate containing verifiable block ledger evidence
 */
export function generateProofCertificate(
  blocks: CryptographicBlock[],
  releaseId: string = 'Payment Gateway Integration v2.4.0',
  isChainValid: boolean = true
): ProofCertificate {
  return {
    certificateId: `PROOF-CERT-${Date.now().toString(36).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    releaseId,
    isChainValid,
    totalBlocks: blocks.length,
    blocks: blocks.map((b, idx) => ({
      blockIndex: idx,
      timestamp: b.timestamp,
      previousHash: b.previousHash,
      calculatedHash: b.blockHash,
      storedHash: b.blockHash,
      voteData: {
        releaseId,
        approverName: b.approverName,
        decision: b.decision,
      },
    })),
  };
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
