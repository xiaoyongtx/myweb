declare module 'jsqr' {
  interface Point {
    x: number;
    y: number;
  }

  interface QRCode {
    data: string;
    location: {
      topLeftCorner: Point;
      topRightCorner: Point;
      bottomRightCorner: Point;
      bottomLeftCorner: Point;
    };
  }

  function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: {
      inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth';
    }
  ): QRCode | null;

  export default jsQR;
}