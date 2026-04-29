/**
 * Utilidades para manejo de fechas y zonas horarias
 */

/**
 * Convierte una fecha en formato YYYY-MM-DD a un objeto Date local
 * Sin aplicar conversiones de zona horaria
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {Date} - Objeto Date
 */
function parseDateLocalString(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Convierte un objeto Date a string en formato YYYY-MM-DD
 * Usando la zona horaria local
 * @param {Date} date - Objeto Date
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
function dateToLocalString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Valida que una hora esté en formato HH:mm
 * @param {string} hora - Hora en formato HH:mm
 * @returns {boolean}
 */
function isValidHora(hora) {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(hora);
}

/**
 * Obtiene horarios disponibles entre dos horas
 * @param {number} horaInicio - Hora de inicio (0-23)
 * @param {number} horaFin - Hora de fin (0-23)
 * @param {string[]} horasOcupadas - Array con horas ocupadas en formato HH:mm
 * @returns {string[]} - Array con horas disponibles
 */
function getHorariosDisponibles(horaInicio = 8, horaFin = 18, horasOcupadas = []) {
  const horariosDisponibles = [];
  
  for (let hora = horaInicio; hora < horaFin; hora++) {
    const horarioFormato = `${String(hora).padStart(2, '0')}:00`;
    if (!horasOcupadas.includes(horarioFormato)) {
      horariosDisponibles.push(horarioFormato);
    }
  }
  
  return horariosDisponibles;
}

module.exports = {
  parseDateLocalString,
  dateToLocalString,
  isValidHora,
  getHorariosDisponibles
};
