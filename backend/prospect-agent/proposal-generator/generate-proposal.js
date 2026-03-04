/**
 * Example execution: generate proposal PDF for a client.
 * Run: node generate-proposal.js
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { generateProposal } from './lib/generateProposal.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

generateProposal({
  cliente: 'Casa Amaranta',
  logoCliente: './assets/logos/logo.png',
  logoTu: './assets/logos/mylogo.png',
  mockups: [
    './assets/mockups/mockup1.png',
    './assets/mockups/mockup2.png',
  ],
  tipoNegocio: 'restaurante',
  planes: {
    basico: '150.000 CLP',
    profesional: '200.000 CLP',
    enterprise: '270.000 CLP',
  },
})
  .then((outputPath) => {
    console.log('PDF generado:', outputPath);
  })
  .catch((err) => {
    console.error('Error generando propuesta:', err);
    process.exitCode = 1;
  });
