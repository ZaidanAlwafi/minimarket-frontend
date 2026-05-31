import { LS_KEYS, loadLS, saveLS } from '../pos/posStorage.js';

export function nextPoNumber() {
  const year = new Date().getFullYear();
  let seq = Number(loadLS(LS_KEYS.nextPoSeq, 1)) || 1;
  const po = `PO-${year}-${String(seq).padStart(3, '0')}`;
  saveLS(LS_KEYS.nextPoSeq, seq + 1);
  return po;
}

export function formatReturNo(id) {
  const year = new Date().getFullYear();
  return `RET-${year}-${String(id).padStart(3, '0')}`;
}
