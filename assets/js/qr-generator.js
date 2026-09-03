/**
 * EasyCoin Interactive QR Generator & Scanner Engine
 * Generates crisp SVG vector QR codes and simulates interactive camera scanning with voice feedback.
 */
class EasyQRService {
  constructor() {
    this.userVpa = 'harish.chandra@easycoin';
    this.userName = 'Harish Chandra';
  }

  // Generates a clean high-contrast SVG QR Code pattern with embedded EasyCoin emblem
  generateQRCodeSVG(payloadText = 'upi://pay?pa=harish.chandra@easycoin&pn=Harish%20Chandra', size = 220) {
    // Standard 25x25 matrix pattern representation with corner finder patterns
    const matrix = [
      "11111110101010101111111",
      "10000010011001101000001",
      "10111010100110101011101",
      "10111010011100101011101",
      "10111010110011001011101",
      "10000010010101101000001",
      "11111110101010101111111",
      "00000000110100100000000",
      "10110101001110011011011",
      "01001110110101100100101",
      "11010011001100110110110",
      "00101100110011001001001",
      "11010111011011010110110",
      "01001000100100110011010",
      "10110111110100101011011",
      "00000000101110100000000",
      "11111110010101011111111",
      "10000010110011001000001",
      "10111010011101101011101",
      "10111010100110001011101",
      "10111010011001101011101",
      "10000010110100101000001",
      "11111110101011001111111"
    ];

    const rows = matrix.length;
    const cols = matrix[0].length;
    const cellSize = (size / rows).toFixed(2);

    let rects = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Leave room in center for EasyCoin emblem
        if (r >= 9 && r <= 13 && c >= 9 && c <= 13) continue;

        if (matrix[r][c] === '1') {
          const x = (c * cellSize).toFixed(2);
          const y = (r * cellSize).toFixed(2);
          rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#00081B" rx="1" />`;
        }
      }
    }

    const centerPos = (size / 2 - 22).toFixed(2);

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" class="easy-qr-svg">
        <rect width="100%" height="100%" fill="#FFFFFF" rx="16" />
        <g>${rects}</g>
        <!-- Center Emblem -->
        <g transform="translate(${centerPos}, ${centerPos})">
          <circle cx="22" cy="22" r="20" fill="#003DD1" stroke="#FFFFFF" stroke-width="3" />
          <text x="22" y="28" font-family="sans-serif" font-size="20" font-weight="800" fill="#FFFFFF" text-anchor="middle">₹</text>
        </g>
      </svg>
    `;
  }
}

window.EasyQR = new EasyQRService();
