

export const  normalizeChainId = (chainId: string | number | bigint): number => {
    if (typeof chainId === "string")
      return Number.parseInt(
        chainId,
        chainId.trim().substring(0, 2) === "0x" ? 16 : 10
      );
    if (typeof chainId === "bigint")
      return Number(chainId);
    return chainId;
  }


const Utils = { normalizeChainId}

export default Utils