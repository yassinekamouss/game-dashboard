
import { Chart, registerables } from 'chart.js';

// Enregistrer tous les composants nécessaires de Chart.js
Chart.register(...registerables);

// Configuration globale (optionnelle)
Chart.defaults.font.family = "'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
Chart.defaults.color = '#666';