// 1. Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {

  // 2. Obtener referencias a inputs y secciones
  const form          = document.getElementById('calcForm');
  const capitalInput  = document.getElementById('capital');
  const tasaInput     = document.getElementById('tasa');
  const periodoInt    = document.getElementById('periodoInteres');
  const duracionInput = document.getElementById('duracion');
  const periodoDur    = document.getElementById('periodoDuracion');
  const depositosIn   = document.getElementById('depositos');
  const ajusteChk     = document.getElementById('ajusteInflacion');
  const inflacionIn   = document.getElementById('inflacion');

  const resultadosSec = document.getElementById('resultados');
  const saldoSpan     = document.getElementById('saldoFinal');
  const invertidoSpan = document.getElementById('totalInvertido');
  const depositosSpan = document.getElementById('depositosTotales');
  const interesesSpan = document.getElementById('interesesTotales');
  const canvas        = document.getElementById('grafico').getContext('2d');

  let chart; // para la instancia de Chart.js

  // Habilitar o no el campo de inflación
  ajusteChk.addEventListener('change', () => {
    inflacionIn.disabled = !ajusteChk.checked;
    if (!ajusteChk.checked) inflacionIn.value = '';
  });

 // 3. Escuchar envío del formulario
  form.addEventListener('submit', e => {
    e.preventDefault();

        // 4. Leer y validar datos
        const C   = parseFloat(capitalInput.value);
        const T   = parseFloat(tasaInput.value) / 100;
        const pI  = periodoInt.value;        // 'anual' o 'mensual'
        let n     = parseInt(duracionInput.value);
        const pD  = periodoDur.value;        // 'anios' o 'meses'
        const M   = parseFloat(depositosIn.value) || 0;
        const infl= ajusteChk.checked
                 ? parseFloat(inflacionIn.value) / 100
                 : 0;

        if (ajusteChk.checked && isNaN(infl)) {
            alert('Por favor completa el campo requerido correctamente.');
            return;
        }

        // unificar unidades: todo en meses
        const tasaMes    = pI   === 'anual'   ? T / 12 : T;
        n               = pD   === 'anios'   ? n * 12 : n;

        // 5. Cálculos mes a mes
        let saldo       = C;
        let invertido   = C;
        let totalDep    = 0;
        const datosGraf = []; // saldo mensual para graficar

        for (let i = 1; i <= n; i++) {
        // añadir depósito
            saldo    += M;
            totalDep += M;

            // calcular interés de ese mes
            const interes = saldo * tasaMes;
            saldo       += interes;

            datosGraf.push(saldo);
        }


        // ajuste por inflación: convertir saldo a valor real
        const factorInfl = Math.pow(1 + infl, n / 12);
        const saldoReal  = infl > 0
                       ? saldo / factorInfl
                       : saldo;

        // 6. Resultados parciales
        invertido += totalDep;
        const interesesTot = saldo - invertido;

        // 7. Actualizar HTML
        resultadosSec.classList.remove('hidden');
        saldoSpan.textContent     = saldoReal.toFixed(2);
        invertidoSpan.textContent = invertido.toFixed(2);
        depositosSpan.textContent = totalDep.toFixed(2);
        interesesSpan.textContent = interesesTot.toFixed(2);

        resultadosSec.classList.remove('hidden');

    
        // 8. Graficar con Chart.js
    let labels, dataToPlot;
    if (pD === 'meses') {
      // Mostramos cada mes
      labels     = datosGraf.map((_, i) => `Mes ${i+1}`);
      dataToPlot = datosGraf;
    } else {
      // Agrupamos cada 12 meses para mostrar por año
      const años       = datosGraf.length / 12;
      labels           = [];
      dataToPlot       = [];
      for (let y = 1; y <= años; y++) {
        const idx      = y * 12 - 1;      // Índice del mes 12, 24, 36, etc...
        labels.push(`Año ${y}`);          // "Año 1", "Año 2", etc...
        dataToPlot.push(datosGraf[idx]);  // Saldo al cierre de cada año.
      }
    }
    if (chart) chart.destroy();
    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{ label: 'Saldo ($)', data: dataToPlot, fill: false, tension: 0.1 }]
      },
      options: {
        scales: {
          x: { title: { display: true, text: pD === 'meses' ? 'Mes' : 'Año' } },
          y: { title: { display: true, text: 'Saldo' } }
        },
      }
    });
  });

  // Limpiar resultados y gráfico al resetear el formulario
  const limpiarBtn = document.getElementById('limpiarBtn');
  form.addEventListener('reset', () => {
    resultadosSec.classList.add('hidden');
    if (chart) chart.destroy();
    saldoSpan.textContent = '';
    invertidoSpan.textContent = '';
    depositosSpan.textContent = '';
    interesesSpan.textContent = '';
    inflacionIn.disabled = true;
  });
}); // Cierre de DOMContentLoaded
