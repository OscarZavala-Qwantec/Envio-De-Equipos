# Workera · Gestión de Envíos

Sistema web moderno para gestionar clientes, tickets/tracking, calendario de envíos e inventario.

## Incluye
- **Resumen:** indicadores y próximos envíos.
- **Clientes:** RUC, razón social, contacto y series.
- **Tickets / Tracking:** cliente, RUC, serie, código de tracking y nombre de archivo PDF/imagen.
- **Calendario:** marcar días disponibles/no disponibles y programar envíos.
- **Inventario:** serie, modelo, cliente, ubicación y estado.
- Diseño responsive inspirado en el logo Workera, con blanco/negro y acentos discretos.
- Persistencia local temporal mediante `localStorage` para poder probar la interfaz inmediatamente.

## Preparación para Firebase
La estructura está separada para sustituir `localStorage` por Firebase/Firestore y Storage:
- `clients`
- `tickets`
- `equipment`
- `shipments`
- `calendarAvailability`

Los archivos adjuntos deben almacenarse en **Firebase Storage** y guardar en Firestore la URL, nombre, tipo y referencia del documento.

## Siguiente integración recomendada
1. Firebase Authentication para usuarios.
2. Firestore para clientes, envíos, tickets, inventario y disponibilidad.
3. Firebase Storage para PDFs e imágenes.
4. Reglas de seguridad por rol.
5. Historial de cambios y auditoría.
