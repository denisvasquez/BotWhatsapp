const RESPONSES = {
    locations: `Estas son nuestras ubicaciones disponibles:
1. Zona 1
2. Zona 10
3. Mixco`,

    schedule: `Nuestro horario de atención es:
Lunes a viernes: 8:00 AM - 6:00 PM
Sábado: 8:00 AM - 1:00 PM
Domingo: Cerrado`,

    priceAvailability: `Para consultas de precio y disponibilidad, indícanos el producto que te interesa y con gusto te compartimos la información.`,

    fallback: `No entendí tu mensaje. Puedes escribir:
- Ubicaciones
- Horarios
- Precio
- Disponibilidad`
};

const normalizeText = (text) => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

const detectIntent = (message) => {
    const text = normalizeText(message);

    const locationRegex = /\b(ubicacion|ubicaciones|direccion|direcciones|sucursal|sucursales|donde estan|donde se ubican|que ubicaciones hay)\b/i;
    const scheduleRegex = /\b(horario|horarios|hora de atencion|horas de atencion|atienden|a que hora abren|a que hora cierran)\b/i;
    const priceAvailabilityRegex = /\b(precio|precios|cuanto cuesta|cuanto vale|valor|disponible|disponibilidad|hay en stock|tienen|existencia|stock)\b/i;

    if (locationRegex.test(text)) {
        return "locations";
    }

    if (scheduleRegex.test(text)) {
        return "schedule";
    }

    if (priceAvailabilityRegex.test(text)) {
        return "priceAvailability";
    }

    return "fallback";
}

module.exports = {
    RESPONSES,
    detectIntent
}