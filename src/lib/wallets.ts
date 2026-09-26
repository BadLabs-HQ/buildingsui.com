// Phantom dropped Sui support, so keep it out of the wallet list.
export const noPhantom = { filterFn: (w: { name: string }) => !/phantom/i.test(w.name) };
